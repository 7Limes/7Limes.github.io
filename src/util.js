function moveToward(x, toValue, amount) {
    amount = Math.abs(amount);

    if (x < toValue) {
        x += amount;
        if (x > toValue) {
            x = toValue;
        }
    }
    if (x > toValue) {
        x -= amount;
        if (x < toValue) {
            x = toValue;
        }
    }
    return x;
}


function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
}
