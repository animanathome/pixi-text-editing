Text editing and deformation


https://motionarray.com/motion-graphics-templates/modern-titles-963408/?listing_position=23&q=kinetic%20typography&search_header=1

- fix tests
- create text animation effects within a react app
  - add visual range limits
- add visual tests
- text editing
- asset selection and manipulation

// TODO:
[ ] - cleanup creating and update workflow. We need to ensure that all objects get created before we start updating them.
Currently a lot of objects only get created duration update. We shouldn't do that as we can't interact with objects that
haven't been created yet. We do need some terminology for this. Maybe we should call it "preparing" or "initializing"?