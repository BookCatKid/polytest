import { PolyMod } from "https://pml.crjakob.com/PolyTrackMods/PolyModLoader/0.5.1/PolyModLoader.js";
class YourMod extends PolyMod {
    init = (pml) => {
        this.pml = pml; // so pml is accessible outside of init (not neccesary)
        // regular init
    }
    postInit = () => {
        // post init
    }
    simInit = () => {
        // sim init here
    }
}
export let polyMod = new YourMod();
