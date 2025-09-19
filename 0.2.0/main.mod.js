import { PolyMod, MixinType } from "https://pml.crjakob.com/PolyTrackMods/PolyModLoader/0.5.1/PolyModLoader.js"

class GhostToggleMod extends PolyMod {
    init = (pml) => {
        this.pml = pml;
        // this.ghostEnabled = true;
        // pml.registerBindCategory("Ghost Toggle Mod");
        // pml.registerKeybind("Toggle Ghost", "ghostToggle", "keydown", "KeyO", null, (e) => { this.ghostEnabled = !this.ghostEnabled; });
        // pml.registerClassMixin("EI.prototype", "update",MixinType.REPLACEBETWEEN, `e.car.getTime().numberOfFrames`, `e.car.getTime().numberOfFrames`, `(ActivePolyModLoader.getMod("${this.id}").ghostEnabled ? e.car.getTime().numberOfFrames : 0)`)
        // pml.registerClassMixin("EI.prototype", "update",MixinType.INSERT, `e.car.setCarState(t)`, `;if(!ActivePolyModLoader.getMod("${this.id}").ghostEnabled) break;`)
        pml.registerClassMixin("xT.prototype", "update", MixinType.REPLACEBETWEEN, "const t = ", "let n;", "10");
    }
}

export let polyMod = new GhostToggleMod();
