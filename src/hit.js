// hit.js — AABB collision between two units' hitArea rectangles.
// hitArea is {x,y,width,height} relative to the object's local centre.

function worldRect(obj) {
  const h = obj.hitArea;
  if (!h) return null;
  return { x: obj.x + h.x, y: obj.y + h.y, w: h.width, h: h.height };
}

export function hitTest(a, b) {
  const r1 = worldRect(a);
  const r2 = worldRect(b);
  if (!r1 || !r2) return false;
  return (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.y + r1.h > r2.y
  );
}
