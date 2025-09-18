import { PolyMod, MixinType } from "https://pml.crjakob.com/polytrackmods/PolyModLoader/0.5.1/PolyModLoader.js";
class polyEditor extends PolyMod {
    editorDeleteSelection = () => {
        let trackE = this.pml.getFromPolyTrack(`b_(ActivePolyModLoader.editorExtras.trackEditorClass, MS, "f")`);
        let track = trackE.getTrackData();
        
        let pillar1 = null;
        let pillar2 = null;

        track.forEachPart((x,y,z,id) => {
            console.log(id)
            if (id == this.pml.editorExtras.blockNumberFromId("CopyPillar1")) {            // CopyPillar1
                pillar1 = {x:x, y:y, z:z};
            } else if (id == this.pml.editorExtras.blockNumberFromId("CopyPillar2")) {    // CopyPillar2
                pillar2 = {x:x, y:y, z:z};
            }
        });

        if (pillar1 == null || pillar2 == null) {
            console.error("Pillars not defined");
            return;
        };

        let minX = Math.min(pillar1.x, pillar2.x);
        let maxX = Math.max(pillar1.x, pillar2.x);
        let minY = Math.min(pillar1.y, pillar2.y);
        let maxY = Math.max(pillar1.y, pillar2.y);
        let minZ = Math.min(pillar1.z, pillar2.z);
        let maxZ = Math.max(pillar1.z, pillar2.z);

        let deletions = []

        track.forEachPart((x,y,z,id, rotation, rotationAxis, color, checkpointOrder, startOrder) => {
            if (
                (x >= minX && x <= maxX) &&
                (y >= minY && y <= maxY) &&
                (z >= minZ && z <= maxZ) 
            ) {
                deletions.push({
                    id: id,
                    x: x,
                    y: y,
                    z: z,
                    rotation: rotation,
                    rotationAxis: rotationAxis,
                    color: color,
                    checkpointOrder: checkpointOrder,
                    startOrder: startOrder,
                })
                trackE.deleteSpecificPart(
                    id,
                    x,
                    y,
                    z,
                    rotation,
                    rotationAxis
                )
            }
        });

        this.pml.getFromPolyTrack(`b_(ActivePolyModLoader.editorExtras.trackEditorClass, HM, "f")`).push({removed: deletions, added: []})

        this.pml.getFromPolyTrack(`
            b_(ActivePolyModLoader.editorExtras.trackEditorClass, MS, "f").generateMeshes(),
             null === (n = b_(ActivePolyModLoader.editorExtras.trackEditorClass, jM, "f")) ||
               void 0 === n ||
               n.refresh(b_(ActivePolyModLoader.editorExtras.trackEditorClass, MS, "f")),
             b_(ActivePolyModLoader.editorExtras.trackEditorClass, QS, "f").setFromExistingCheckpoints(b_(ActivePolyModLoader.editorExtras.trackEditorClass, MS, "f")),
             y_(ActivePolyModLoader.editorExtras.trackEditorClass, bM, !1, "f");
              `)
    }
    editorCopy = () => {
        let trackE = this.pml.getFromPolyTrack(`b_(ActivePolyModLoader.editorExtras.trackEditorClass, MS, "f")`);
        let track = trackE.getTrackData();
        
        let pillar1 = null;
        let pillar2 = null;

        track.forEachPart((x,y,z,id) => {
            if (id == this.pml.editorExtras.blockNumberFromId("CopyPillar1")) {            // CopyPillar1
                pillar1 = {x:x, y:y, z:z};
            } else if (id == this.pml.editorExtras.blockNumberFromId("CopyPillar2")) {    // CopyPillar2
                pillar2 = {x:x, y:y, z:z};
            }
        });

        if (pillar1 == null || pillar2 == null) {
            console.error("Pillars not defined");
            return;
        };

        let minX = Math.min(pillar1.x, pillar2.x);
        let maxX = Math.max(pillar1.x, pillar2.x);
        let minY = Math.min(pillar1.y, pillar2.y);
        let maxY = Math.max(pillar1.y, pillar2.y);
        let minZ = Math.min(pillar1.z, pillar2.z);
        let maxZ = Math.max(pillar1.z, pillar2.z);

        let selectedBlocks = [];
        track.forEachPart((x,y,z,id,r,rAxis,environment,cpOrder,startOrder) => {
            if (id == this.pml.editorExtras.blockNumberFromId("CopyPillar1") || id == this.pml.editorExtras.blockNumberFromId("CopyPillar2")) {
                return;
            }
            if (
                (x <= maxX && x >= minX) &&
                (y <= maxY && y >= minY) &&
                (z <= maxZ && z >= minZ)
            ) {
                selectedBlocks.push({
                    x:x-pillar1.x,
                    y:y-pillar1.y,
                    z:z-pillar1.z,
                    id:id,r:r,rAxis:rAxis,environment:environment,cpOrder:cpOrder,startOrder:startOrder});
            }
        });

        this.pillarSelectedBlocks = selectedBlocks;
    }
    init = (pml) => {
        this.pml = pml;
        this.editorUndoStack = [];
        this.pillarSelectedBlocks = null;
        this.TrackEditor = null;
        this.inEditor = false;
        this.SELECTED_BLOCK_POSITION = null;
        pml.getFromPolyTrack("or").prototype.MergeGeometry = function(geo2) {
            var geo1 = this;
            var attributes = ["color", "normal", "position"];    // , "skinIndex", "skinWeight"
            var dataLengths = [3, 3, 4, 4];
            var geo = new or();
            for (var attIndex = 0; attIndex < attributes.length; attIndex++) {
                var currentAttribute = attributes[attIndex];
                var geo1Att = geo1.getAttribute(currentAttribute);
                var geo2Att = geo2.getAttribute(currentAttribute);
                var currentArray = null;
                if (currentAttribute == "skinIndex") currentArray = new Uint16Array(geo1Att.array.length + geo2Att.array.length)
                else currentArray = new Float32Array(geo1Att.array.length + geo2Att.array.length)
                var innerCount = 0;
                geo1Att.array.map((item) => {
                    currentArray[innerCount] = item;
                    innerCount++;
                });
                geo2Att.array.map((item) => {
                    currentArray[innerCount] = item;
                    innerCount++;
                });
                geo1Att.array = currentArray;
                geo1Att.count = currentArray.length / dataLengths[attIndex];
                geo.setAttribute(currentAttribute, geo1Att);
            }
            return geo;
        }

        // PILLAR BLOCKS
        pml.editorExtras.registerCategory("CopyPillars", "CopyPillar1"); // category
        
        pml.editorExtras.registerModel(`${this.baseUrl}/${this.modVersion}/assets/copy_pillars.glb`);

        pml.editorExtras.registerBlock("CopyPillar1", "CopyPillars", "b235ea87337c17de7cbaecaf3d381fff9782e8379bcbc1c6cc9882da4aa1da15", "CopyPillars", "CopyPillar1", [[[-1, 0, -1], [0, 0, 0]]], { ignoreOnExport: true })
        pml.editorExtras.registerBlock("CopyPillar2", "CopyPillars", "b235ea87337c17de7cbaecaf3d381fff9782e8379bcbc1c6cc9882da4aa1da15", "CopyPillars", "CopyPillar2", [[[-1, 0, -1], [0, 0, 0]]], { ignoreOnExport: true })
        pml.editorExtras.registerBlock("PlacePillar", "CopyPillars", "11e08bcda67d312b41341da10ca37fa08625064c642f1631e45c882cbc3d8a46", "CopyPillars", "PlacePillar", [[[-1, 0, -1], [0, 0, 0]]], { ignoreOnExport: true })

        // UI

        const targetNode = document.getElementById("ui");
        const config = { childList: true };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                for(const addedNode of mutation.addedNodes) {
                    if(addedNode.className === "editor") {
                        this.inEditor = true;
                        let editorSidebar = addedNode.children[3];

                        const copyButton = document.createElement("button")
                        , copyImage = document.createElement("img");
                        copyImage.src = `${this.baseUrl}/${this.modVersion}/assets/clipboard.svg`;
                        copyButton.appendChild(copyImage);
                        copyButton.addEventListener("click", ( () => {
                            pml.soundManager.playUIClick();
                            this.editorCopy();
                        }));
                        editorSidebar.prepend(copyButton);
                    }
                }
                for(const removedNode of mutation.removedNodes) {
                    if(removedNode.className === "editor") {
                        this.inEditor = false;
                    }
                }
            }
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
        pml.registerClassMixin("pk.prototype", "refresh", MixinType.INSERT, `get("Height") + ": " + e.toString();`, 'let locationn = ActivePolyModLoader.getMod("polyeditor").SELECTED_BLOCK_POSITION;if(locationn != null) {uk(this, sk, "f").textContent += ` Location: (${locationn.x}, ${locationn.y}, ${locationn.z})`;};');
        pml.registerClassMixin("A_.prototype", "update", MixinType.INSERT, `y_(this, DM, b_(this, bS, "m", f_).call(this), "f"),`, 'ActivePolyModLoader.getMod("polyeditor").SELECTED_BLOCK_POSITION = b_(this, DM, "f"),b_(this, jS, "f").refresh(b_(this, bS, "a", h_)),')
        
        // UNDO STUFF

        pml.registerClassMixin("A_.prototype", "update", MixinType.REPLACEBETWEEN, `n.isStart && (o = b_(this, MS, "f").getNextStartOrder()),`, `b_(this, MS, "f").generateMeshes(),`, `
            n.isStart && (o = b_(this, MS, "f").getNextStartOrder());
            let selectedEnvironment = b_(this, bS, "m", a_).call(this);
            let selectedRotation = b_(this, BM, "f");
            let selectedAxis = b_(this, UM, "f");
            let addedList = []
            if (n.id == (${pml.editorExtras.blockNumberFromId("PlacePillar")})) {
                let selectedBlocks = ActivePolyModLoader.getMod("polyeditor").pillarSelectedBlocks
                if (selectedBlocks == null) {
                    console.log("selectedBlocks is null");
                    return;
                }

                for (let block of selectedBlocks) {
                    let x = block.x;
                    let y = block.y;
                    let z = block.z;
                    
                    let positionVector = new bn(x, y, z);

                    let axis = new bn(0, 1, 0);

                    let rad = selectedRotation * Math.PI / 2;
                    positionVector.applyAxisAngle(axis, rad);

                    x = positionVector.x + e.x;
                    y = positionVector.y + e.y;
                    z = positionVector.z + e.z;

                    x = Math.round(x);
                    y = Math.round(y);
                    z = Math.round(z);  

                    let newRotation = block.r; //= (block.r + selectedRotation) % 4;
                    let newAxis = block.rAxis; //= (block.rAxis + selectedAxis) % 6;

                    for (let i = 0; i < selectedRotation; i++) {
                        switch (newAxis) {
                            case 0:
                                newAxis = 0;
                                newRotation += 1;
                                break;
                            case 1:
                                newAxis = 1;
                                newRotation += 1;
                                break;
                            case 2:
                                newAxis = 5;
                                switch (newRotation) {
                                    case 0:
                                        newRotation -= 1;
                                        break;
                                    case 1:
                                        newRotation += 1;
                                        break;
                                    case 2:
                                        newRotation -= 1;
                                        break;
                                    case 3:
                                        newRotation += 1;
                                        break;
                                }
                                break;
                            case 3:
                                newAxis = 4;
                                switch (newRotation) {
                                    case 0:
                                        newRotation += 1;
                                        break;
                                    case 1:
                                        newRotation -= 1;
                                        break;
                                    case 2:
                                        newRotation += 1;
                                        break;
                                    case 3:
                                        newRotation -= 1;
                                        break;
                                }
                                break;
                            case 4:
                                newAxis = 2;
                                newRotation += 1;
                                break;
                            case 5:
                                newAxis = 3;
                                newRotation -= 1;
                                break;
                            default:
                                console.log("Invalid axis ??")
                        };
                        newRotation = (4 + newRotation) % 4;
                    };
                    if(y >= 0) {
                        b_(this, MS, "f").setPart(      // add the part in the track
                            x, y, z, block.id,
                            newRotation, 
                            newAxis, 
                            selectedEnvironment == 0 ? block.environment : selectedEnvironment, 
                            block.cpOrder, 
                            block.startOrder
                        ) 
                        addedList.push({
                            id: block.id,
                            x: x,
                            y: y,
                            z: z,
                            rotation: newRotation,
                            rotationAxis: newAxis,
                            color: block.environment,
                            checkpointOrder: block.cpOrder,
                            startOrder: block.startOrder,
                        })
                    }
                };
                b_(this, HM, "f").push({ removed: [], added: addedList})
            } else {
                b_(this, MS, "f").setPart(
                      e.x,
                      e.y,
                      e.z,
                      n.id,
                      b_(this, BM, "f"),
                      b_(this, UM, "f"),
                      b_(this, bS, "m", a_).call(this),
                      s,
                      o
                    );  
                a.push({
                    id: n.id,
                    x: e.x,
                    y: e.y,
                    z: e.z,
                    rotation: b_(this, BM, "f"),
                    rotationAxis: b_(this, UM, "f"),
                    color: b_(this, bS, "m", a_).call(this),
                    checkpointOrder: s,
                    startOrder: o,
                })
            };
            b_(this, bS, "m", p_).call(this),
            y_(
                    this,
                    FM,
                    {
                    x: e.x,
                    y: e.y,
                    z: e.z,
                    id: n.id,
                    rotation: b_(this, BM, "f"),
                    rotationAxis: b_(this, UM, "f"),
                    },
                    "f"
                ),
            b_(this, MS, "f").generateMeshes(),`);
        pml.registerClassMixin("A_.prototype", "update", MixinType.REPLACEBETWEEN, `if (b_(this, CM, "f")) b_(this, bS, "m", g_).call(this, i, r);`, `if (b_(this, CM, "f")) b_(this, bS, "m", g_).call(this, i, r);`, `
                          if (b_(this, CM, "f")) {
                          if (n.id == (${pml.editorExtras.blockNumberFromId("PlacePillar")})) {
                            let selectedBlocks = ActivePolyModLoader.getMod("polyeditor").pillarSelectedBlocks
                            if (selectedBlocks != null) {
                                let minX = Number.MAX_SAFE_INTEGER;
                                let minY = Number.MAX_SAFE_INTEGER;
                                let minZ = Number.MAX_SAFE_INTEGER;
                                let maxX = Number.MIN_SAFE_INTEGER;
                                let maxY = Number.MIN_SAFE_INTEGER;
                                let maxZ = Number.MIN_SAFE_INTEGER;

                                for (let block of selectedBlocks) {
                                    if (block.x < minX) {
                                        minX = block.x;
                                    }
                                    if (block.x > maxX) {
                                        maxX = block.x;
                                    }
                                    if (block.y < minY) {
                                        minY = block.y;
                                    }
                                    if (block.y > maxY) {
                                        maxY = block.y;
                                    }
                                    if (block.z < minZ) {
                                        minZ = block.z;
                                    }
                                    if (block.z > maxZ) {
                                        maxZ = block.z;
                                    }
                                };

                                let tileList = [];

                                for (let x = minX; x <= maxX; x++) {
                                    for (let y = minY; y <= maxY; y++) {
                                        for (let z = minZ; z <= maxZ; z++) {
                                            tileList.push([x, y, z]);
                                        };
                                    };
                                };

                                let overlap = b_(this, bS, "m", m_).call(this, e, new OA(tileList));
                                b_(this, bS, "m", g_).call(this, overlap, r);
                            };
                        } else {
                            b_(this, bS, "m", g_).call(this, i, r);
                        };}`);
                        
        // pml.registerFuncMixin("SM", MixinType.REPLACEBETWEEN, `var t;`, `_M(this, DS, !1, "f"))`, `
        //     var n;
        //     let i = !1;

        //     let removedParts = [];
        //     for (const {x: t, y: i, z: r} of e) {
        //         let toBeRemoved = b_(this, MS, "f").getPartsAt(t, i, r);
        //         for (let part of toBeRemoved) {
        //             removedParts.push([part.x, part.y, part.z, part.id, part.rotation, part.rotationAxis, part.color, part.checkpointOrder, part.startOrder]);
        //         };
        //         b_(this, MS, "f").deletePartsAt(t, i, r) && (n = !0);
        //     };

        //     i &&
        //     (b_(this, bS, "m", p_).call(this),
        //     b_(this, MS, "f").generateMeshes(),
        //     null === (n = b_(this, jM, "f")) ||
        //       void 0 === n ||
        //       n.refresh(b_(this, MS, "f")),
        //     b_(this, QS, "f").setFromExistingCheckpoints(b_(this, MS, "f")),
        //     y_(this, bM, !1, "f"));
        //     `)
        // KEYBIND AND SETTINGS STUFF

        pml.registerBindCategory("PolyEditor Mod");
        pml.registerKeybind("Copy Selection", "copySelection", "keydown", "KeyC", null, (e) => {if(this.inEditor) this.editorCopy();});
        pml.registerKeybind("Delete Selection", "deleteSelection", "keydown", "KeyB", null, (e) => {if(this.inEditor) this.editorDeleteSelection();});
        pml.registerKeybind("Quick Select Paste", "quickPaste", "keydown", "KeyL", null, () => {
            if(this.inEditor) 
                pml.getFromPolyTrack(
                `b_(ActivePolyModLoader.editorExtras.trackEditorClass, qM, 0, "f"),
                b_(ActivePolyModLoader.editorExtras.trackEditorClass, bS, "m", l_).call(ActivePolyModLoader.editorExtras.trackEditorClass, b_(ActivePolyModLoader.editorExtras.trackEditorClass, QM, "f")[ActivePolyModLoader.editorExtras.blockNumberFromId("PlacePillar") -1].category),
                b_(ActivePolyModLoader.editorExtras.trackEditorClass, bS, "m", c_).call(ActivePolyModLoader.editorExtras.trackEditorClass, ActivePolyModLoader.editorExtras.blockNumberFromId("PlacePillar") -1);`
            )
            
        });
        pml.registerSettingCategory("Builder Checkins");
        pml.registerSetting("Check in on builder", "builderCheckIn", "boolean", false);
        pml.registerSetting("Check in volumer", "checkInVolume", "slider", 1);

        // HIGHLIGHT

        pml.registerFuncMixin("c_", MixinType.REPLACEBETWEEN, `t.isCheckpoint`, `y_(this, TM, n, "f");`,
            `t.isCheckpoint
              ? b_(this, QS, "f").show()
              : b_(this, QS, "f").hide();
            let tiles = t.tiles;
            let n;
            console.log(e);
            if (e == (${pml.editorExtras.blockNumberFromId("PlacePillar")} - 1)) {
                let selectedBlocks = ActivePolyModLoader.getMod("polyeditor").pillarSelectedBlocks;
                
                let minX = Number.MAX_SAFE_INTEGER;
                let minY = Number.MAX_SAFE_INTEGER;
                let minZ = Number.MAX_SAFE_INTEGER;
                let maxX = Number.MIN_SAFE_INTEGER;
                let maxY = Number.MIN_SAFE_INTEGER;
                let maxZ = Number.MIN_SAFE_INTEGER;
                try {
                for (let block of selectedBlocks) {
                    if (block.x < minX) {
                        minX = block.x;
                    }
                    if (block.x > maxX) {
                        maxX = block.x;
                    }
                    if (block.y < minY) {
                        minY = block.y;
                    }
                    if (block.y > maxY) {
                        maxY = block.y;
                    }
                    if (block.z < minZ) {
                        minZ = block.z;
                    }
                    if (block.z > maxZ) {
                        maxZ = block.z;
                    }
                };} catch(e) {};

                tiles = [];
                let index = 0;
                for (let x = minX; x < maxX; x++) {
                    tiles.push({x:x, y:minY, z:minZ, index:index});
                    index++;
                    tiles.push({x:x, y:maxY, z:minZ, index:index});
                    index++;
                    tiles.push({x:x, y:minY, z:maxZ, index:index});
                    index++;
                    tiles.push({x:x, y:maxY, z:maxZ, index:index});
                    index++;
                };

                for (let y = minY; y < maxY; y++) {
                    tiles.push({x:minX, y:y, z:minZ, index:index});
                    index++;
                    tiles.push({x:maxX, y:y, z:minZ, index:index});
                    index++;
                    tiles.push({x:minX, y:y, z:maxZ, index:index});
                    index++;
                    tiles.push({x:maxX, y:y, z:maxZ, index:index});
                    index++;
                };

                for (let z = minZ; z < maxZ; z++) {
                    tiles.push({x:minX, y:minY, z:z, index:index});
                    index++;
                    tiles.push({x:maxX, y:minY, z:z, index:index});
                    index++;
                    tiles.push({x:minX, y:maxY, z:z, index:index});
                    index++;
                    tiles.push({x:maxX, y:maxY, z:z, index:index});
                    index++;
                };

                n = new pa(
                    b_(this, _M, "f"),
                    b_(this, MM, "f"),
                    tiles.length
                );
                for (let tile of tiles) {
                    let x = tile.x;
                    let y = tile.y;
                    let z = tile.z;
                    let index = tile.index;
                    const a = (new Xn).makeTranslation(x * Cx.partSize, y * Cx.partSize, z * Cx.partSize);
                    n.setMatrixAt(index, a);
                };
            } else {
                n = new pa(
                    b_(this, _M, "f"),
                    b_(this, MM, "f"),t.tiles.length);
                t.tiles.forEach(((e, t, i, r) => {
                    const a = (new Xn).makeTranslation(e * Cx.partSize, t * Cx.partSize, i * Cx.partSize);
                    n.setMatrixAt(r, a);
                }));
            };b_(this, kM, "f").add(n);y_(this, TM, n, "f");`
        )

    }
    encourage() {
        if(this.pml.getSetting("builderCheckIn") === "true") 
            if(this.inEditor) {
                let i = Math.floor(Math.random() * this.encouragementLines.length);
                this.pml.soundManager.playSound(this.encouragementLines[i], parseFloat(this.pml.getSetting("checkInVolume")));
            }
        setTimeout(() => this.encourage(), 900000);
    }
    onGameLoad = () => {
        this.TrackEditor = this.pml.editorExtras.trackEditorClass;

        // ENCOURAGEMENT
        this.pml.soundManager.registerSound("encouragementLine1", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line1.flac`]);
        this.pml.soundManager.registerSound("encouragementLine2", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line2.flac`]);
        this.pml.soundManager.registerSound("encouragementLine3", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line3.flac`]);
        this.pml.soundManager.registerSound("encouragementLine4", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line4.flac`]);
        this.pml.soundManager.registerSound("encouragementLine5", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line5.flac`]);
        this.pml.soundManager.registerSound("encouragementLine6", [`${this.baseUrl}/${this.modVersion}/assets/encouragement/line6.flac`]);
        this.encouragementLines = [];
        this.encouragementLines.push(
            "encouragementLine1",
            "encouragementLine2",
            "encouragementLine3",
            "encouragementLine4",
            "encouragementLine5",
            "encouragementLine6"
        );
        this.encourage();
    }
}


export let polyMod = new polyEditor();