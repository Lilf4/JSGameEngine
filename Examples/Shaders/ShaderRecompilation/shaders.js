var VertexShader = `attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);  // Positions of the vertices
    vTexCoord = aTexCoord;  // Pass texture coordinates
}`

var HoleThingie = `precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float u_timeScale;
uniform float uTime;

varying vec2 vTexCoord;

void main() {
    vec4 O = vec4(0.0);
    float i = 1.0; // Start at 1.0 to prevent division by zero

    vec2 r = uResolution.xy;
    vec2 F = vTexCoord * uResolution; // Convert UV to pixel coordinates

    vec2 p = (F + F - r) / r.y / 0.7;
    vec2 d = vec2(-1.0, 1.0);
    vec2 q = 5.0 * p - d;

    vec2 c = p * mat2(1.0, 1.0, d / (0.1 + 5.0 / dot(q, q)));
    vec2 v = c * mat2(cos(log(length(c)) + (uTime * u_timeScale) * 0.2 + vec4(0.0, 33.0, 11.0, 0.0))) * 5.0;

    for (int j = 0; j < 9; j++) { // Using an integer loop variable instead
        O += 1.0 + sin(v.xyyx);
        v += 0.7 * sin(v.yx * float(j) + (uTime * u_timeScale)) / float(j + 1) + 0.5;
    }

    i = length(sin(v / 0.3) * 0.2 + c * vec2(1.0, 2.0)) - 1.0;

    O = 1.0 - exp(
        -exp(c.x * vec4(0.6, -0.4, -1.0, 0.0)) 
        / O
        / (1.0 + i * i)
        / (0.5 + 3.5 * exp(0.3 * c.y - dot(c, c)))
        / (0.03 + abs(length(p) - 0.7))
    );

    vec4 originalColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = originalColor += O;
}`;

var FancyLights = `precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
varying vec2 vTexCoord;
uniform sampler2D uTexture;

vec3 palette(float d) {
    return mix(vec3(0.2, 0.7, 0.9), vec3(1.0, 0.0, 1.0), d);
}

vec2 rotate(vec2 p, float a) {
    float c = cos(a);
    float s = sin(a);
    return p * mat2(c, s, -s, c);
}

float map(vec3 p) {
    for (int i = 0; i < 8; ++i) {
        float t = uTime * 0.2;
        p.xz = rotate(p.xz, t);
        p.xy = rotate(p.xy, t * 1.89);
        p.xz = abs(p.xz);
        p.xz -= 0.5;
    }
    return dot(sign(p), p) / 5.0;
}

vec4 rm(vec3 ro, vec3 rd) {
    float t = 0.0;
    vec3 col = vec3(0.0);
    float d;

    for (float i = 0.0; i < 64.0; i++) {
        vec3 p = ro + rd * t;
        d = map(p) * 0.5;

        if (d < 0.02) {
            break;
        }
        if (d > 100.0) {
            break;
        }

        col += palette(length(p) * 0.1) / (400.0 * d);
        t += d;
    }

    return vec4(col, 1.0 / (d * 100.0));
}

void main() {
    vec2 fragCoord = vTexCoord * uResolution;
    vec2 uv = (fragCoord - (uResolution.xy * 0.5)) / uResolution.x;

    vec3 ro = vec3(0.0, 0.0, -50.0);
    ro.xz = rotate(ro.xz, uTime);
    vec3 cf = normalize(-ro);
    vec3 cs = normalize(cross(cf, vec3(0.0, 1.0, 0.0)));
    vec3 cu = normalize(cross(cf, cs));

    vec3 uuv = ro + cf * 3.0 + uv.x * cs + uv.y * cu;
    vec3 rd = normalize(uuv - ro);
    vec4 col = rm(ro, rd);

    vec4 originalColor = texture2D(uTexture, vTexCoord);

    gl_FragColor = col + originalColor;
}`;

var Pipes = `precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
varying vec2 vTexCoord;

#define hash(x) fract(sin(x) * 43758.5453123)

vec3 pal(float t) {
    return 0.5 + 0.5 * cos(6.28 * (1.0 * t + vec3(0.0, 0.1, 0.1)));
}

float stepNoise(float x, float n) {
    const float factor = 0.3;
    float i = floor(x);
    float f = x - i;
    float u = smoothstep(0.5 - factor, 0.5 + factor, f);
    float res = mix(floor(hash(i) * n), floor(hash(i + 1.0) * n), u);
    res /= (n - 1.0) * 0.5;
    return res - 1.0;
}

vec3 path(vec3 p) {
    vec3 o = vec3(0.0);
    o.x += stepNoise(p.z * 0.05, 5.0) * 5.0;
    o.y += stepNoise(p.z * 0.07, 3.975) * 5.0;
    return o;
}

float diam2(vec2 p, float s) {
    p = abs(p);
    return (p.x + p.y - s) * inversesqrt(3.0);
}

vec3 erot(vec3 p, vec3 ax, float t) {
    return mix(dot(ax, p) * ax, p, cos(t)) + cross(ax, p) * sin(t);
}

void main() {
    vec2 fragCoord = vTexCoord * uResolution;
    vec2 uv = (fragCoord - 0.5 * uResolution.xy) / uResolution.y;

    vec3 col = vec3(0.0);
    vec3 ro = vec3(0.0, 0.0, -1.0), rt = vec3(0.0);
    ro.z += uTime * 5.0;
    rt.z += uTime * 5.0;
    ro += path(ro);
    rt += path(rt);

    vec3 z = normalize(rt - ro);
    vec3 x = vec3(z.z, 0.0, -z.x);
    float e = 0.0, g = 0.0;
    vec3 rd = mat3(x, cross(z, x), z) * erot(normalize(vec3(uv, 1.0)), vec3(0.0, 0.0, 1.0), stepNoise(uTime + hash(uv.x * uv.y * uTime) * 0.05, 6.0));

    for (int i = 0; i < 99; ++i) { 
        vec3 p = ro + rd * g;
        p -= path(p);
        float r = 0.0;
        vec3 pp = p;
        float sc = 1.0;

        for (int j = 0; j < 4; ++j) {
            r = clamp(r + abs(dot(sin(pp * 3.0), cos(pp.yzx * 2.0)) * 0.3 - 0.1) / sc, -0.5, 0.5);
            pp = erot(pp, normalize(vec3(0.1, 0.2, 0.3)), 0.785 + float(j));
            pp += pp.yzx + float(j) * 50.0;
            sc *= 1.5;
            pp *= 1.5;
        }

        float h = abs(diam2(p.xy, 7.0)) - 3.0 - r;
        p = erot(p, vec3(0.0, 0.0, 1.0), path(p).x * 0.5 + p.z * 0.2);
        float t = length(abs(p.xy) - 0.5) - 0.1;
        h = min(t, h);
        g += e = max(0.001, (t == h ? abs(h) : h));

        col += (t == h ? vec3(0.3, 0.2, 0.1) * (100.0 * exp(-20.0 * fract(p.z * 0.25 + uTime))) * mod(floor(p.z * 4.0) + mod(floor(p.y * 4.0), 2.0), 2.0) : vec3(0.1)) * 0.0325 / exp(float(i) * float(i) * e);
    }

    col = mix(col, vec3(0.9, 0.9, 1.1), 1.0 - exp(-0.01 * g * g * g));

    gl_FragColor = vec4(col, 1.0);
}`;