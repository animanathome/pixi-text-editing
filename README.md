pr to refactor: https://github.com/Lumen5/luminary/pull/3662/files


https://www.learnwithjason.dev/blog/learn-rollup-js




|t|e|x|t| | |m|e|

0 - t
1 - e
2 - x
3 - t
4 - space
5 - space
6 - m
7 - e
8 - space (end of line)


string -> tokens -> glyphs -> generate geometry
                      |
                      V
                  selection

for each token in text:
  - get metrics (if available, what about spaces and new lines?)
  - represent as rectangle (4 points)
  - collect all rectangle as points
  - transform individual token

then
  - transform all tokens as points (if necessary) -> deformers

  - create a rectangle for each token used for selection
  - if necessary, create a vertex (rectangle), index and uv array for each token for rendering