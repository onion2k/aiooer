# Part 5: 3D

2026-09-19 · @Someone

## About this part

This is the fifth of seven parts in the generative media module. The aims of the course, the layout every part follows and suggested reading routes are in [Course introduction](file/0a139f54-ef01). The format is the same as before: **In plain terms** opens each numbered section, deep dives are optional, and a glossary closes the part. Reading time is about 25 minutes.

[Part 1](file/7c41d2a9-1e05) described the machine. 3D is the medium it fits least comfortably, and the one where the distance between "looks right" and "is usable" is greatest.

### What part 5 gives you

Part 5 builds one idea: a picture only has to look right, and a 3D object has to work. It will be lit, turned, textured, animated, collided with, printed or loaded on a phone by software that has requirements. Generation has become good at the shape and the surface. What separates a generated object from a usable asset is everything a viewer cannot see, and that is where a person's time still goes.

## 1. Why 3D is the hard one

**In plain terms.** There are billions of pictures to learn from and only a few million good 3D models. There is also no single agreed way to store a 3D object, as there is for a picture. And an object has to look right from every side, including the sides nobody showed the model. **Who should read it:** everyone.

Three things set 3D apart from the other media.

- **Data.** Image models learned from billions of captioned pictures. The largest open collection of 3D objects has around ten million, of very uneven quality, and the carefully made ones number in the hundreds of thousands. Every method in this part is, one way or another, a way of coping with that.
- **Representation.** An image is a grid of pixels, and everyone agrees on that. A 3D object can be stored in half a dozen quite different ways, which section 2 describes, and the choice decides what a model can learn and what the result can be used for.
- **The unseen sides.** A photograph shows one side of a thing. A 3D object has a back, an underside and an inside, all of which must exist and agree with the front. When the input is a single picture, most of the object has to be invented.

One more difference matters more than any of these in practice. Images, video and music are finished when they look or sound right. A 3D object is nearly always an input to something else, a game engine, an animation rig, a renderer, a printer, and each has technical requirements the object must meet. Section 6 is about that gap.

## 2. What a 3D asset is

**In plain terms.** The 3D objects used in games, films and products are hollow shells made of triangles, with pictures wrapped round them for colour. Some newer formats store a cloud of coloured blobs instead, which look superb and cannot easily be edited. Which one you get decides what you can do with it. **Who should read it:** anyone unfamiliar with 3D. Those who work in it can skip to section 3.

### Meshes

The standard asset is a mesh: a list of points in space, and a list of triangles or four-sided faces joining them into a surface. A mesh is a shell with nothing inside it. Four further things make it usable.

- **Topology** is how the faces are arranged. A good mesh has an orderly flow of faces that follows the form, with more of them where the surface bends. This matters little for a rock, and decides whether a character's elbow can bend.
- **A UV map** is a flattening of the surface onto a square, like the pattern pieces for a garment, which says which part of a flat image goes where on the shape.
- **Textures** are the images wrapped on with that map. Modern assets carry several: base colour, and maps for how rough and how metallic each point is, so that a renderer can work out how it reflects light. These are called PBR materials, for physically based rendering.
- **A rig** is an internal skeleton with rules for how the surface follows it. Only things that move need one.

### The alternatives

| Representation | What it stores | Good for | Poor for |
| --- | --- | --- | --- |
| Mesh | Points and faces, with textures | Everything downstream: engines, animation, editing, printing | Learning. Meshes are irregular, and no two have the same layout |
| Voxels | A 3D grid of cells, filled or empty | Learning. It is the 3D version of pixels | Detail. The grid grows with the cube of its resolution |
| Signed distance field | For any point in space, how far it is from the surface | Smooth shapes, and converting to a mesh | Open or paper-thin surfaces |
| Radiance field | A small network that returns colour and density for any point and viewing direction | Photographic capture of real scenes | Editing. There is no surface to grab |
| Gaussian splats | Millions of soft coloured blobs | Very fast, photographic rendering of captured scenes | Editing, animation, collisions. Again there is no surface |

A guide to this field puts the practical distinction well: a mesh you can edit in an engine is a different deliverable from a splat you can view. Much of what is impressive in demonstrations is the second kind, and much of what production needs is the first.

Models generate in whichever form is easiest to learn, which is rarely a mesh, and convert at the end. That conversion is where much of section 6's trouble comes from.

## 3. Three ways to make a shape

**In plain terms.** The first method borrowed an image model and used it as a critic, nudging a 3D shape until pictures of it looked right. It was slow and made odd mistakes. The second gets an image model to draw the object from several sides and rebuilds the shape from those drawings. The third, now the best, trains part 1's machine directly on 3D shapes. **Who should read it:** non-technical readers need only the plain terms above. The rest is how the field got round its shortage of data.

### Borrowing an image model as a critic

The 2022 method that started the field used no 3D training data at all. Begin with a random 3D shape. Render it from a random angle. Show that picture to an image diffusion model and ask, in effect, how it should change to look more like "a ceramic owl". Pass that correction back into the 3D shape. Repeat thousands of times from different angles.

It worked, which was remarkable. It also took an hour or more per object, and had a characteristic failure: the image model knows what an owl looks like from the front far better than from behind, so objects grew faces on several sides. It is rarely used now, and it explains why the field's first instinct was to lean on image models.

### Several views, then rebuild

The second approach keeps the image model and gives it an easier job. Fine-tune it to produce several pictures of one object from fixed angles, consistent with each other. Then hand those views to a separate reconstruction network that builds the shape.

This inherits the quality and variety of image models, and their data. Its weakness is that the views are never perfectly consistent, and the reconstruction has to reconcile them, which blurs detail.

A stripped-down relative skips the diffusion step: a large network trained to go from one image straight to a 3D shape in a single pass. These reconstruct an object in under a second, at lower fidelity, and suit uses where speed matters more than finish.

### Diffusion on 3D itself

The current best models apply part 1's recipe directly. Train an autoencoder that compresses a 3D object into a latent: typically a sparse grid of cells near the surface, each holding a short list of numbers, so that empty space costs nothing. Then train a diffusion transformer, the same kind as in images and video, to turn noise into such latents, steered by an input image.

The leading open models work this way. One, at 4 billion parameters, generates textured objects at a resolution of up to 1,536 cells a side, taking from three seconds to a minute on a data-centre GPU depending on the resolution, and needs a card with 24 GB of memory. Its makers chose a sparse-cell representation specifically so that it can handle open surfaces, thin sheets and enclosed interior parts, which defeated earlier field-based approaches.

### One triangle at a time

Part 1's other design has a niche here. A mesh can be written as a sequence, one triangle after another, and a transformer trained on meshes made by artists learns to produce the tidy, economical topology they produce. These models handle only modest face counts, since every face is many tokens. They are of interest because topology, as section 6 explains, is the thing the other methods get wrong.

## 4. Start from an image

**In plain terms.** Just as with video, the best way to get a 3D object is to make a good picture of it first. Nearly all 3D generators really work from a picture, and "text to 3D" usually means a picture is made for you behind the scenes. Giving it several views is better still. **Who should read it:** everyone who will make 3D. This is the working method.

The strongest 3D models take an image as their input, and no text. Where a product offers text-to-3D, it is almost always generating an image first and feeding that in. Doing the first step yourself gives you control over it, for the same reasons part 3 gave for video: a still is quick and cheap, you can generate fifty and choose one, and everything in parts 6 and 7 applies to making it.

The image needs to be the kind the 3D model was trained on, which means the kind of picture that accompanies 3D assets, and not a photograph with atmosphere.

- **One object, whole, and centred,** with nothing cut off by the frame.
- **A plain background,** which the tools will remove anyway.
- **Even, flat lighting.** Shadows and highlights in the picture get baked into the surface colour, and then the object looks wrong when a renderer lights it again. This is the commonest avoidable fault.
- **A three-quarter view** from slightly above shows the most surfaces at once.
- **Characters in a neutral pose,** arms away from the body, if they are ever to be rigged.

Whatever the picture does not show, the model invents. The back of a jacket, the underside of a chair and the far side of a vehicle are plausible guesses. Models that accept several views, front, side and back, remove most of that guessing, and an image model can produce those views as a consistent set, using part 6's reference techniques.

This has a consequence worth stating plainly. A 3D object generated from a photograph of a real thing is not a scan of it. Its proportions are approximate and its hidden sides are fiction. For a model of a real object that must be accurate, such as a product for an online shop or a part for manufacture, the right tools are photogrammetry and scanning, which measure, or the original design files.

## 5. Shape, then surface

**In plain terms.** The better systems work in two stages, as a modeller does: first the shape, then the paint. The painting stage draws the object's surface from several sides at once, working on the finished shape, and produces the separate material layers that renderers expect. **Who should read it:** non-technical readers can skip this section.

Splitting the job lets each stage use the method that suits it. One widely used open system publishes its division of labour: a 3.3 billion parameter diffusion transformer generates the shape from the input image, and a separate 2 billion parameter model paints it. Generating a shape needs about 10 GB of graphics memory, painting it needs 21 GB, and both together 29 GB.

The painting stage is a multi-view image diffusion model, so part 1 applies once more. It is given the finished geometry, rendered from several angles as depth and surface-direction maps, which are control images in exactly part 6's sense. It generates the views of the surface to fit, consistent with each other, and those are projected onto the mesh and blended into textures.

Two things are worth knowing about this stage.

- **It can be run on its own.** A shape made by a person, or an existing asset, can be given to the painting stage for a new surface. For teams with modellers this is often the most useful part: many variations of surface on geometry that is already correct.
- **Materials are the recent gain.** Earlier systems produced a single colour image with the lighting of the input picture baked in. Current ones produce separate colour, roughness and metalness maps, so that a renderer can light the object properly. It is this, more than any gain in shape, that moved generated objects from curiosities to usable props.

## 6. What "usable" means

**In plain terms.** A generated object is usually fine as a static prop seen from a distance. It is usually not ready to be animated, edited, put in a mobile game or 3D-printed, because the mesh underneath is a disorderly skin of far too many triangles. Tidying that up is skilled work, and it is where the time goes. **Who should read it:** everyone. This is the section to read before anyone promises a 3D pipeline.

Generators work in cells or fields and convert to a mesh at the end, by an algorithm that wraps a surface of triangles over the result. The output looks right and is built wrong.

- **Topology.** The triangles are small, uniform and arranged without regard to the form. A guide to current tools puts typical output at 20,000 to 300,000 triangles per object, with none of the loops of faces around joints and features that animation needs. A character has to be retopologised, rebuilt as a clean mesh over the generated one, before it can be rigged. Tools automate part of that, and for anything that deforms, a person finishes it.
- **Triangle budget.** An object that a game would give 5,000 triangles arrives with 200,000. Automatic reduction works for rigid props and damages fine features.
- **UV maps.** Automatically produced maps are fragmented into hundreds of small islands. They render correctly and are close to impossible for a texture artist to paint on.
- **One fused lump.** A chair with a cushion, a character with clothes, a vehicle with wheels: all arrive as a single welded surface. Nothing can be removed, swapped or moved separately. This is part 1's flat output in its 3D form.
- **Thin and fine structure.** Wires, railings, hair, foliage, fingers and lettering come out thickened, merged or missing, since they fall below the resolution of the cells.
- **Assumed symmetry, and invented backs.** Models lean towards symmetric completions of what they cannot see.
- **No scale, no units, no pivot.** Size and orientation are arbitrary and must be set by hand.
- **Not necessarily solid.** Printing needs a closed, watertight surface with sensible wall thickness. Generated meshes often have holes, internal faces and surfaces with no thickness.
- **Baked lighting.** Section 4's fault: a highlight or shadow painted into the colour map.

The same guide gives a fair summary of where that leaves things: static props and environment pieces are usable in production today, and hero characters still need a person's pass on topology.

### What it suits

Background and mid-distance props, set dressing, and objects for concept work and pre-visualisation. Rapid prototyping, where a designer wants to turn something round and look at it. Objects for virtual and augmented reality scenes that are looked at and not manipulated. Figurines and decorative prints, after a repair pass. Starting points for a modeller, who may find it quicker to rebuild over a generated shape than to begin from nothing.

### What it does not

Anything a player or a camera gets close to. Anything that animates. Anything that must be dimensionally accurate. Anything that will be edited later by someone who expects an orderly mesh.

## 7. The model families

**In plain terms.** Here, unusually, the open models are about as good as the hosted ones at making the shape. What the hosted services add is the clean-up: simpler meshes, rigging and export to game engines. **Who should read it:** anyone choosing a tool.

As of September 2026:

| Family | From | Open weights | Notes |
| --- | --- | --- | --- |
| TRELLIS | Microsoft | Yes, MIT licence | Diffusion on sparse 3D latents. The second version has 4 billion parameters, handles open and thin surfaces, and outputs full PBR materials. Needs 24 GB |
| Hunyuan3D | Tencent | Yes, own licence | Separate shape and painting models, with PBR materials from mid-2025. The painting model works on your own meshes. Later versions are offered as a hosted service |
| Fast reconstructors | Several labs | Yes | Single-pass image-to-3D in about a second, at lower fidelity. For interactive uses |
| Meshy, Tripo, Rodin and others | Start-ups | No | Hosted services. They compete on what happens after generation: low-polygon modes, retopology, automatic rigging, animation, and plug-ins for engines and modelling tools |

Two points matter more than the rows.

- **Open is close to the front.** Unlike video and music, the open shape generators are competitive with hosted ones, in part because the field is young and the models are small enough to train outside the largest labs. The permissive licences are notable too.
- **Read the terms on output.** Several hosted services publish what you make on their free tier under an open licence, or forbid commercial use of it. As with music, the plan decides what you may do.

### Scenes and worlds

Everything above makes single objects. Generating a whole navigable scene is a separate and much younger line of work, which meets the world models that part 3 described coming from video. Open and hosted systems released from mid-2025 will produce an explorable environment from a picture or a description, usually as splats or as a panorama with depth, and not as a set of separate editable objects. They are useful now for backdrops and for quickly exploring a space. They are not yet a way to build a level.

### The whiteboard version

3D has little training data, no agreed representation, and sides nobody showed the model. The field first borrowed image models, as a critic and then as a source of several views to rebuild from. The best current systems run part 1's machine directly on a compressed 3D form, one model for the shape and another to paint it with proper materials, working from an input picture. So start from a good picture: one object, flat lighting, three-quarter view, or better, several views. What comes out looks right and is built wrong: a fused skin of too many disorderly triangles with a fragmented texture map. That is fine for static props and needs a modeller's time for anything that moves, is edited or must be accurate. A generated object is not a scan.

## Say it two ways

| Idea | Technical version | Non-technical version |
| --- | --- | --- |
| Why 3D lags | Orders of magnitude less training data, no canonical representation, and supervision only from visible surfaces | There are billions of pictures to learn from and only a few million good 3D models, and nobody agrees how to store one |
| Native 3D diffusion | A diffusion transformer over sparse structured latents from a 3D autoencoder, conditioned on an image | The same start-from-static machine as for pictures, working on a squashed-down 3D shape |
| Shape, then surface | Geometry generation followed by mesh-conditioned multi-view diffusion for PBR textures | First it sculpts, then it paints, drawing the surface from several sides at once so that they match |
| Topology | The connectivity and flow of a mesh's faces, which governs deformation, editing and efficiency | How the triangles are laid out. Generated ones are a disorderly skin. Anything that has to bend needs them rebuilt by a person |
| Mesh against splats | An explicit editable surface against an unstructured set of radiance primitives | A shell you can edit against a cloud of coloured blobs you can only look at |

## Misconceptions to correct

Three claims come up constantly. Agree with the true part first, then add what it leaves out.

### "Type a description, get a game-ready asset"

**True:** a description or a picture now produces a convincing textured object in under a minute, and hosted services will reduce, rig and export it.

**Misleading:** "game-ready" means a sensible triangle count, clean topology, a usable texture map, correct scale and, for characters, a rig that deforms properly. Generated objects meet that bar for static background props and miss it for nearly everything else without a modeller's time.

**What to say:** "It will fill a scene with background props this week. For anything that moves or gets close to the camera, it gives our artists a head start, not a finished asset. Let us measure the clean-up time before we plan around it."

### "We can turn product photos into 3D models for the website"

**True:** image-to-3D works from a single photo, and the result will look like the product from the front.

**Misleading:** it is an invention and not a measurement. Proportions are approximate, and everything the photo does not show is made up. Customers turning it round would be looking at a guess. Showing it as the product is a misdescription.

**What to say:** "For the real product we use the design files, or scan it. Generated models are for the things around the product, not the product."

### "A splat and a mesh are the same thing in different formats"

**True:** both are 3D, both can be viewed from any angle, and splats often look better.

**Misleading:** a splat scene is a cloud of blobs with no surfaces. It cannot easily be edited, animated, collided with or relit, and it does not convert cleanly to a mesh. It is a way of viewing a captured or generated place, not of building one.

**What to say:** "Ask what we need to do with it. To look around, a splat is fine and often lovelier. To change it, animate it or put it in a game, we need a mesh."

## Glossary

Every technical term used in this part, in plain language and in alphabetical order. Terms from part 1 are not repeated.

| Term | Meaning |
| --- | --- |
| Baked lighting | Shadows and highlights painted into an object's colour, so that it looks wrong when lit again |
| Gaussian splats | A scene stored as millions of soft coloured blobs. Fast and photographic to view, hard to edit |
| Image-to-3D | Generating a 3D object from one or more pictures of it |
| Mesh | A surface made of points joined into triangles or four-sided faces. The standard 3D asset |
| Multi-view diffusion | An image model that produces several mutually consistent views of one object |
| PBR materials | Texture maps for colour, roughness and metalness that let a renderer light a surface realistically |
| Photogrammetry | Reconstructing an accurate 3D model of a real object from many photographs |
| Radiance field | A scene stored as a network that returns colour and density for any point and direction |
| Reconstruction | Building a 3D shape from one or more images |
| Retopology | Rebuilding a mesh with clean, efficient, well-arranged faces over a messy one |
| Rig | The internal skeleton and rules that let a mesh be posed and animated |
| Score distillation | The early method of shaping a 3D object by using an image model as a critic of its renders |
| Signed distance field | A shape stored as the distance from any point to its surface |
| Sparse structured latent | A compressed 3D form that stores numbers only in cells near the surface |
| Topology | How a mesh's faces are arranged and connected |
| UV map | The flattening of a 3D surface onto a square, which says where each part of a texture goes |
| Voxel | One cell of a 3D grid. The 3D counterpart of a pixel |
| Watertight | A mesh with no holes, enclosing a volume. Needed for printing |

## Sources

Figures and dates in this part come from these documents, read in September 2026.

- [DreamFusion: Text-to-3D using 2D Diffusion](https://arxiv.org/abs/2209.14988), 2022, for using an image model as a critic
- [Objaverse-XL](https://arxiv.org/abs/2307.05663), 2023, for the ten million object collection
- [3D Gaussian Splatting](https://arxiv.org/abs/2308.04079), 2023, for splats
- [LRM: Large Reconstruction Model](https://arxiv.org/abs/2311.04400), 2023, for single-pass image-to-3D
- [MeshGPT](https://arxiv.org/abs/2311.15475), 2023, for generating meshes one triangle at a time
- [Structured 3D Latents for Scalable and Versatile 3D Generation](https://arxiv.org/abs/2412.01506), 2024, for diffusion on sparse 3D latents
- [TRELLIS.2](https://github.com/microsoft/TRELLIS.2), for the 4 billion parameters, resolutions, timings, memory, materials and licence
- [Hunyuan3D 2.1](https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1), 2025, for the separate shape and painting models, their sizes and memory needs, and PBR materials
- [AI 3D model generators in 2026](https://app.cinevva.com/guides/ai-3d-model-generators), for typical triangle counts, the limits on rigged characters, the distinction between meshes and splats, and hosted services' terms
