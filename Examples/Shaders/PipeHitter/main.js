Engine = new GameEngine(
	document.getElementById('Screen'), 
	new Vector2(800, 800),
    60,
    true
);

Engine.SetInitFunction(INIT);
Engine.SetLoopFunction(GAMELOGIC);

async function INIT(){
	//Gets called once when the engine is started
}

async function GAMELOGIC(delta){
	//Game loop, gets called once every frame
}

Engine.vertexShader = `attribute vec2 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);  // Positions of the vertices
    vTexCoord = aTexCoord;  // Pass texture coordinates
}`

Engine.fragmentShader = `precision mediump float;

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
}
`

Engine.Start();
