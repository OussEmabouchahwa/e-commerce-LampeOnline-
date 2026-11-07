import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Sliders } from 'lucide-react';
// Color temperature conversion from Kelvin to hex/rgb
function kelvinToHex(kelvin) {
    const temp = kelvin / 100;
    let red, green, blue;
    if (temp <= 66) {
        red = 255;
        green = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
        if (temp <= 19) {
            blue = 0;
        }
        else {
            blue = Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
        }
    }
    else {
        red = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
        green = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
        blue = 255;
    }
    const toHex = (n) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}
function Product3DScene({ model, isOn, colorTemp, }) {
    const lightHex = kelvinToHex(colorTemp);
    const bulbHex = isOn ? lightHex : '#333333';
    const lightIntensity = isOn ? 3.5 : 0;
    return (_jsxs("group", { position: [0, -1, 0], children: [_jsxs("mesh", { position: [0, 0, 0], children: [_jsx("cylinderGeometry", { args: [0.8, 0.9, 0.12, 32] }), _jsx("meshStandardMaterial", { color: model.baseColor, roughness: 0.3, metalness: 0.8 })] }), _jsxs("mesh", { position: [0, 1.1, 0], children: [_jsx("cylinderGeometry", { args: [0.05, 0.05, 2.1, 16] }), _jsx("meshStandardMaterial", { color: model.stemColor, roughness: 0.2, metalness: 0.9 })] }), model.shade === 'cone' && (_jsxs("mesh", { position: [0, 2.1, 0], children: [_jsx("coneGeometry", { args: [0.8, 0.9, 32, 1, true] }), _jsx("meshStandardMaterial", { color: model.shadeColor, roughness: 0.5, side: 2 })] })), model.shade === 'dome' && (_jsxs("mesh", { position: [0, 2.1, 0], children: [_jsx("sphereGeometry", { args: [0.75, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2] }), _jsx("meshStandardMaterial", { color: model.shadeColor, roughness: 0.5, side: 2 })] })), model.shade === 'cylinder' && (_jsxs("mesh", { position: [0, 2.1, 0], children: [_jsx("cylinderGeometry", { args: [0.65, 0.65, 0.9, 32, 1, true] }), _jsx("meshStandardMaterial", { color: model.shadeColor, roughness: 0.5, side: 2 })] })), model.shade === 'sphere' && (_jsxs("mesh", { position: [0, 2.1, 0], children: [_jsx("sphereGeometry", { args: [0.6, 32, 32] }), _jsx("meshStandardMaterial", { color: model.shadeColor, roughness: 0.2, transparent: true, opacity: 0.85 })] })), _jsxs("mesh", { position: [0, 1.9, 0], children: [_jsx("sphereGeometry", { args: [0.14, 16, 16] }), _jsx("meshStandardMaterial", { color: bulbHex, emissive: bulbHex, emissiveIntensity: isOn ? 2.5 : 0.05, roughness: 0.1 })] }), _jsx("pointLight", { position: [0, 1.8, 0], color: lightHex, intensity: lightIntensity, distance: 6, decay: 2 })] }));
}
export function ProductViewer3D({ model }) {
    const [isOn, setIsOn] = useState(true);
    const [colorTemp, setColorTemp] = useState(model.colorTemp || 3000);
    return (_jsxs("div", { className: "relative w-full aspect-square bg-surface border border-line rounded-card overflow-hidden flex flex-col justify-between", children: [_jsx("div", { className: "w-full h-full cursor-grab active:cursor-grabbing", children: _jsx(Suspense, { fallback: _jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx("span", { className: "text-xs text-mute animate-pulse", children: "Chargement 3D..." }) }), children: _jsxs(Canvas, { camera: { position: [0, 0.8, 4.2], fov: 45 }, dpr: [1, 2], gl: { antialias: true, alpha: true }, children: [_jsx("ambientLight", { intensity: 0.4 }), _jsx("directionalLight", { position: [5, 8, 5], intensity: 0.5 }), _jsx(Product3DScene, { model: model, isOn: isOn, colorTemp: colorTemp }), _jsx(OrbitControls, { enableZoom: false, enablePan: false, minPolarAngle: Math.PI / 4, maxPolarAngle: Math.PI / 1.8 })] }) }) }), _jsxs("div", { className: "absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md border border-line rounded-card p-3 shadow-low space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs font-semibold text-ink", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsxs("button", { onClick: () => setIsOn(!isOn), className: "px-2.5 py-1 rounded-input border border-line hover:border-bulb transition-colors flex items-center gap-1.5", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${isOn ? 'bg-bulb shadow-[0_0_6px_var(--bulb)]' : 'bg-mute'}` }), isOn ? 'Allumée' : 'Éteinte'] }) }), _jsxs("div", { className: "flex items-center gap-1.5 text-mute text-[11px]", children: [_jsx(Sliders, { size: 13 }), _jsxs("span", { children: [colorTemp, "K"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[10px] text-mute", children: "2700K (Chaud)" }), _jsx("input", { type: "range", min: 2700, max: 6500, step: 100, value: colorTemp, onChange: (e) => setColorTemp(Number(e.target.value)), className: "w-full h-1.5 rounded-pill bg-line appearance-none cursor-pointer accent-bulb", "aria-label": "Temp\u00E9rature de couleur" }), _jsx("span", { className: "text-[10px] text-mute", children: "6500K (Froid)" })] })] })] }));
}
//# sourceMappingURL=ProductViewer3D.js.map