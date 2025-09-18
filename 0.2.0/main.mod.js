// Import the official PolyMod class from the loader's URL
import { PolyMod } from "https://pml.crjakob.com/PolyTrackMods/PolyModLoader/0.5.1/PolyModLoader.js";

class CheckpointBypassMod extends PolyMod {
    init = (pml) => {
        // Store the PolyModLoader instance so we can use it in other methods
        this.pml = pml;
    }

    postInit = () => {
        console.log("Applying Checkpoint Bypass Mod...");

        try {
            // IMPORTANT: These are the minified names that need to be found.
            // 'jw' is a placeholder for the Car class, and '_isFinish' for the method.
            // You may need to find the current names using the developer console.
            const CarClassName = 'jw';
            const canFinishMethodName = '_isFinish';

            // Get the actual class constructor from the game's scope
            const CarClass = this.pml.getFromPolyTrack(CarClassName);

            // --- Safety Checks ---
            if (!CarClass) {
                console.error(`[Bypass Mod] Error: Could not find class '${CarClassName}'. The game might have updated.`);
                return; // Stop if the class isn't found
            }
            if (!CarClass.prototype[canFinishMethodName]) {
                console.error(`[Bypass Mod] Error: Method '${canFinishMethodName}' not found on class '${CarClassName}'. The game might have updated.`);
                return; // Stop if the method isn't found
            }
            // --- End Safety Checks ---

            // Use the mod loader to OVERRIDE the original function
            this.pml.registerClassMixin(
                CarClass.prototype,           // The object to modify (the Car's prototype)
                canFinishMethodName,            // The name of the method to modify
                this.pml.MixinType.OVERRIDE,  // We want to completely replace the original function
                [],                           // We don't need to access any special variables
                function() {
                    // This is our new function. It will always allow the player to finish.
                    return true;
                }
            );

            console.log("Checkpoint Bypass Mod applied successfully!");

        } catch (error) {
            console.error("Failed to apply the checkpoint bypass mod:", error);
        }
    }

    simInit = () => {
        // This mod does not need to change anything in the physics simulation worker.
    }
}

// Export an instance of your mod class
export let polyMod = new CheckpointBypassMod();
