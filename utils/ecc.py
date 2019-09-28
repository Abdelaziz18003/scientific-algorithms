# add two points p1 & p2 on the curve
# y**2 = x**3 + ax + b in [-n, n] interval
def ecc_add (a, b, n, p1, p2):
    x1, y1 = p1
    x2, y2 = p2
    if (x1 == x2 and y1 == y2):
        beta = (3 * x1**2 + a) / (2 * y1)
    else:
        beta = (y2 - y1) / (x2 - x1) % n
    x = (beta**2 - x1 - x2)
    y = (beta * (x1 - x) - y1) % n
    return (x, y)

# multiply a point p with a scalar k on the curve
# y**2 = x**3 + ax + b in [-n, n] interval
def ecc_mul(a, b, n, p, k):
    x, y = p
    for _ in range(1, k):
        (x, y) = ecc_add(a, b, n, p, p)
    return (x, y)