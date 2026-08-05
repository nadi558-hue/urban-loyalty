#!/usr/bin/env bash
# Convert a Gemini/Veo avatar clip into an animated WebP the app can use.
#
#   ./scripts/avatar-anim.sh <input.mp4> <coach> <pose> [seconds]
#   ./scripts/avatar-anim.sh "~/Downloads/maya_celebrate.mp4" maya celebrate 2.0
#
# The generator cannot output transparency, so the clips are rendered on a flat
# magenta background and keyed here. Two things were calibrated against the
# first real clip and should not be changed casually:
#
#   colorkey tolerance 0.20
#     0.28 ate into Maya's burgundy outfit; 0.08 left a pink halo around the
#     sparkles. 0.20 is the widest value that still leaves the outfit solid.
#
#   the despill geq
#     Semi-transparent sparkles keep some magenta and read pink. Gold has
#     B < G while magenta spill has B > G, so pulling B toward G on exactly
#     those pixels turns the sparkles back to gold and leaves everything else
#     alone. (ffmpeg's own despill filter only handles green/blue screens.)
#
# chromakey= was tried and rejected: it keyed out the character entirely.
set -euo pipefail

IN="${1:?usage: avatar-anim.sh <input.mp4> <coach> <pose> [seconds]}"
COACH="${2:?coach: maya|sara|idan}"
POSE="${3:?pose: celebrate|wave|basic|energetic|streak_flame|empathetic|streak_lost}"
SECS="${4:-2.0}"

OUT_DIR="public/avatars/$COACH"
OUT="$OUT_DIR/$POSE.webp"
mkdir -p "$OUT_DIR"

# Background colour of the render. Sampled, not assumed — the generator does
# not return exactly the #FF00FF that was asked for.
KEY=$(ffmpeg -v error -i "$IN" -vf "crop=10:10:0:0,scale=1:1" -frames:v 1 -f rawvideo -pix_fmt rgb24 - 2>/dev/null \
      | od -An -tu1 | awk '{printf "0x%02X%02X%02X", $1, $2, $3}')
echo "  sampled background: $KEY"
KR=$((16#${KEY:2:2})); KG=$((16#${KEY:4:2})); KB=$((16#${KEY:6:2}))
if [ "$KB" -gt "$KR" ] && [ "$KB" -gt $((KG + 40)) ]; then SCREEN=blue; else SCREEN=magenta; fi
echo "  screen type: $SCREEN"

# Alpha is derived from how far the pixel leans toward the screen colour,
# NOT from ffmpeg's colorkey. colorkey gives PARTIAL alpha to anything merely
# near the key, and the lighter highlights in Maya's burgundy outfit are near
# magenta — they went semi-transparent and the cream page showed through, which
# read as a glossy latex sheen the original art does not have.
#
# These tests are hue-shaped instead of distance-shaped, so a colour can sit
# close to the screen in RGB distance and still be kept:
#   magenta screen: min(R,B) sits well above G   (burgundy's does not)
#   blue screen:    B sits well above max(R,G)
case "$SCREEN" in
  blue)    LEVEL="min(b(X,Y)-r(X,Y),b(X,Y)-g(X,Y))" ;;
  *)       LEVEL="min(r(X,Y),b(X,Y))-g(X,Y)" ;;
esac
KEYALPHA="geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*(1-clip(($LEVEL-25)/60,0,1))'"

DESPILL="geq=r='r(X,Y)':g='g(X,Y)':b='if(gt(b(X,Y),g(X,Y)), g(X,Y)+(b(X,Y)-g(X,Y))*0.30, b(X,Y))':a='alpha(X,Y)'"

# Crop to the visible character so the file isn't mostly empty background.
# Measured from the alpha channel rather than hard-coded, since framing differs
# per clip.
SRC="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$IN")"
export SRC
read -r CW CH CX CY < <(
  ffmpeg -v error -ss $(echo "$SECS" | awk '{print $1/2}') -i "$IN" \
    -vf "format=rgba,$KEYALPHA,scale=180:320" -frames:v 1 -pix_fmt rgba -f rawvideo - 2>/dev/null \
  | node -e "
    const b=[];process.stdin.on('data',d=>b.push(d)).on('end',()=>{
      const x=Buffer.concat(b),W=180,H=320;
      let x0=W,y0=H,x1=0,y1=0;
      for(let y=0;y<H;y++)for(let i=0;i<W;i++){
        if(x[(y*W+i)*4+3]>28){if(i<x0)x0=i;if(i>x1)x1=i;if(y<y0)y0=y;if(y>y1)y1=y;}
      }
      const meta=process.env.SRC.split('x'), SW=+meta[0], SH=+meta[1];
      const sx=SW/W, sy=SH/H, pad=12;
      const cx=Math.max(0,Math.round(x0*sx)-pad), cy=Math.max(0,Math.round(y0*sy)-pad);
      const cw=Math.min(SW-cx,Math.round((x1-x0)*sx)+pad*2);
      const ch=Math.min(SH-cy,Math.round((y1-y0)*sy)+pad*2);
      console.log(cw,ch,cx,cy);
    });"
)
echo "  crop: ${CW}x${CH} at +${CX}+${CY}"

# Looping poses must cycle forever; one-shot poses stop on the final frame.
case "$POSE" in
  celebrate|wave) LOOP=1 ;;
  *)              LOOP=0 ;;
esac

ffmpeg -y -v error -t "$SECS" -i "$IN" \
  -vf "crop=${CW}:${CH}:${CX}:${CY},format=rgba,$KEYALPHA,$DESPILL,fps=10,scale=-1:280" \
  -loop "$LOOP" -q:v 45 -compression_level 6 -an "$OUT"

node -e "
const fs=require('fs');const b=fs.readFileSync('$OUT');
let o=12,c={};
while(o+8<=b.length){const id=b.toString('ascii',o,o+4);const s=b.readUInt32LE(o+4);c[id]=(c[id]||0)+1;o+=8+s+(s&1);}
if(!c.ANMF||c.ANMF<2){console.error('  !! not animated — check the input');process.exit(1);}
console.log('  ->', '$OUT', (fs.statSync('$OUT').size/1024).toFixed(0)+'KB,', c.ANMF, 'frames, loop=$LOOP');
"
