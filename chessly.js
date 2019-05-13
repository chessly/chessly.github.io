
let isOdd = x => (x === 0 ? false : (x & -x) === 1); // isOdd returns T/F for negative and possible values
let chunk = (// chunck a string in equal sizes
  arr, // input Array
  size, // chunk size
  r = [] // result: initialized on first call, set in recursion call
) => (r.push(arr.splice(0, size)), r.concat(arr.length ? chunk(arr, size) : [])); // [] is concatted last!

let dragenter_event = event => {//attached on both empty square and piece in square
  let board = event.target.board;
  let square = event.target.at;// target is img or square
  if (!board) console.warn('drag_enter not square', event.target);
  let piece_at_square = board && board.at(square); //piece OR false
  if (board.draggingPiece.at != square) {
    if (board.attackedPiece) { }// previous attacked piece
    board.attackedPiece = false;
    if (piece_at_square) board.attackedPiece = piece_at_square;
    board.draggingPiece.at = square;
    event.target.board.showmoves(square);
  }
};

const ___WHITE___ = "white";
const ___BLACK___ = "black"
const ___SQUAREWHITE___ = "square" + ___WHITE___; //#f0d9b5
const ___SQUAREBLACK___ = "square" + ___BLACK___; //#b58863
const ___ATTACKED_BY___ = "attackers";
const ___DEFENDED_BY___ = "defenders";
const ___ID_SQUARES___ = "squares";
const ___PROTECTED_BY___ = "protectors";
const ___PROTECTED_BY_WHITE___ = "protectors_" + ___WHITE___;
const ___PROTECTED_BY_BLACK___ = "protectors_" + ___BLACK___;
const ___SQUARE_RELATIONS___ = "relations";
const ___ATTR_PIECE___ = "piece";
const ___ATTR_FROM___ = "from";
const ___EMPTYSQUARE___ = ".";
const ___ELEMENT_IS___ = "is";

const ___AT___ = "at";
const ___OUTLINE___ = "outline";

let games = [
  {
    desc: "Chess",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"
  },
  {
    desc: "Deep Blue versus Kasparov",
    fen: "8/2R5/5q1k/3Q2N1/3p4/PP3pPP/5n1K/4r3"
  }
];

let FEN_translation_Map = new Map(); // Forsyth Edwards Notation

//chess or checkers or any board
let squarecount = (cnt = 8);
let files = [];
let ranks = [];
do {
  files.unshift(String.fromCharCode(64 + cnt)); // A,B,C,D,...
  ranks.push(String(cnt));                      // 1,2,3,4,...
} while (--cnt);
let ranksAscending = [...ranks].reverse(); // 1 to N
let all_board_squares = ranks.map(rank => files.map(file => file + rank)).flat();  // 'A8'.. 'H1'
let squarenameUpperCase = square => (square[0] + square[1]).toUpperCase();
let translateSquare = (
  // ( 'D5' , 1 , -1 ) => E4
  sq, // square: 'D5'
  hf, // horizontal/file translate: -1 0 1
  vr, // vertical/rank translate: -1 0 1
  // *!* declare functions/variables as parameters so function body does not require let and return statement
  val = (
    // function!! *!*
    a, // files OR ranks array
    v, // current file/rank value
    t, // translate: -1 or 0 or 1
    n = a.indexOf(v) + t // new index in files/ranks array *!*
  ) =>
    n > -1 &&
    n < squarecount && // new index is on board
    a[n], // return false or new rank/file

  file = val(files, sq[0], hf), // new file from square translate
  rank = val(ranksAscending, sq[1], vr) // new rank from square translate
) => file && rank && file + rank; // if valid file/rank then return 'D6'

let parametersObject = (
  CE, // input: Custom Element
  init = {}, // optional initial/default parameters  attr-key:value
  attrs = CE.getAttributeNames() // attribute names to be processed
) =>
  attrs.reduce(
    (pars, attr) => (
      (pars[attr] = CE.getAttribute(attr) || undefined), // add parameter  attr-key:value
      pars // return pars in reduce loop
    ),
    init // optional initial/default parameters  attr-key:value
  );
let observedAttributes_to_properties = (
  CE,
  attrs = CE.constructor.observedAttributes
) =>
  attrs.map(attr =>
    Object.defineProperty(CE, attr, {
      get() {
        return CE.getAttribute(attr);
      },
      set(val) {
        val == undefined
          ? CE.removeAttribute(attr)
          : CE.setAttribute(attr, val);
      },
      configurable: true
    })
  );

function game_pieceSVG({
  is,
  outline = "#666",
  detailcolor = "#888"
}) {
  let color = is.includes(___WHITE___) ? 0 : 1;
  let stopcolors = [["eee", "999"], ["111", "888"]][color];
  let fillcolor = ["gold", "silver"][color];
  let circlesize = 50;
  let circle = (cx, cy, r, fcolor = fillcolor) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fcolor}"></circle>`;
  let svg = `data:image/svg+xml` +
    `,<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='933' height='933'>` +
    `${`<defs><linearGradient id='a'><stop offset='50%' stop-color='#${stopcolors[0]}'/><stop offset='100%' stop-color='#${stopcolors[1]}'/></linearGradient></defs>` +
    `<g stroke='${outline}' stroke-width='16' stroke-linecap='round' stroke-linejoin='round' fill='url(#a)' transform='translate(50,0)'>` +
    {
      none: ``,
      pawn:
        `<path d='M397 467c2 170-86 221-128 250-34 24-25 83 20 86 28 1 277 2 306-1 51-6 53-67 20-88-53-32-136-69-139-247 0-33-79-30-79 0z'/>` +
        `<path d='M340 433c-74 19-100 66-100 66h409s-43-52-110-67c-85-19-129-17-199 1'/>` +
        `<path d='M339 714h188' stroke='${detailcolor}'/>` + circle(435, 300, 110, ""),
      knight: `<path d='M529 402c0 76-89 142-176 109-13-5-134 105-154 90-15-12 17-61 15-55-11 30-61 63-100 20-16-16-11-64 22-103 35-41 70-104 84-140 28-73 17-75 69-141 10-12-16-60-6-92 37 7 51 44 69 60 10-23 3-85 21-82 17 3 38 56 67 80 351 108 349 670 250 672-121 2-266 2-388 0-29-1-43-39-37-62 27-108 142-185 198-222 58-39 68-77 66-134M345 294c-29-5-55 3-76 24m29 8c11 10 24 11 26-7M151 518c-14-4-24 18-15 19m181-63l9 12m203-117v-25M326 163l-10 5m63-59c30 42 41 51 5 44M454 131c87 26 72 7 91 37 10 17 24-6 58-4 18 1-50-27-59-38-12-16-102 1-90 5M580 200c27 20 47-1 46 35-1 25 32 8 48 19 15 9 30-29 21-29-15 0-39 7-34-9 9-36-89-22-81-16M660 278c5 2 34 21 32 30-7 48 29 45 44 50 21 7-1-18-12-31s8-19 6-27c-4-30-73-23-70-22M710 379c5 8 17 18 21 32s5 26 13 41c7 15 38 13 51 9 17-6-43-24-29-52 8-18-58-35-56-30M438 730l-26 61'/>`,
      rook:
        `<path d='M200 323s4-117 18-156c30-6 89-9 126-4 1 24-5 74-1 97 33-2 101 2 144-2 1-28-7-68 1-99 27-2 89-4 118 8-4 40 0 95 0 95l76 2-11 60c-95 36-412 30-471-1z'/>` + //rear buttress
        `<path d='M251 702c-24 24-74 49-110 56-5 17-10 37 0 58h586c6-24 11-41 5-60-38-7-83-19-117-54M198 769c149 0 312-6 472 0'/>` + //base
        `<path d='M253 311c-4 45-5 357-4 394 55-4 312-5 368 0-3-70-2-393-2-393'/>` + //tower
        `<path d='M291 635c40-3 124-6 216-3m-217-62c51-5 100-6 171-6m-170-59c72-5 74-5 152-6m-152-58c36-3 58-5 102-4m-58 21v24m55 39l1 25m-56 40v24m117-26v26m-62 42l1 27m-99-296c28-3 42-4 66-3' stroke='${detailcolor}'/>` + //bricks
        `<path d='M132 161l14 96c32 22 50 30 53 67 97-17 387-13 475 0 6-34 16-39 63-68 6-44 11-66 11-92-14-3-115-34-128-29-4 26 2 49-4 73-38 2-71 1-111-9 0-34 0-52 2-77-17-6-115-7-134-1-3 32 1 49-2 78-33 9-65 7-105 9-4-34 2-46 2-70-17-4-121 18-136 23z'/>` + //butress
        `<path d='M189 262c148-14 368-15 496 4' fill='none'/>`, //butress lines
      bishop:
        `<path d='M436 217c11-18 39-51 68-67a511 511 0 0 1 134 339c1 63-32 126-53 149'/>` +
        `<path d='M565 687c7-53-294-49-281 3 10 22 2 50 2 50s69-10 146-9c77 2 129 8 129 8s-2-36 4-52z'/>` +
        `<path d='M279 682c-22-8-39-40-53-61-23-33-37-101-23-178 13-77 86-225 161-291 91 66 150 165 196 298 25 71 37 149 15 230-54-11-234-21-296 2z'/>` +
        `<path d='M490 135c12-21-20-35-3-50 9-8 25-9 35 2 13 15-23 29-6 48'/>` +
        `<path d='M350 139c13-21-19-35-2-50 9-8 25-9 34 2 13 15-22 29-5 48'/>` +
        `<path d='M436 712c-9-2-18 2-21-1-5-3-4-18-1-22 2-3 33-3 36 0 3 2 0 20-2 25'/>` +
        //                + `<path d='M381 349c-11 1-17 14-15 25-1 9 3 20-4 27-10 4-21 0-31-1-9-1-19-4-27 1-5 7 1 17 9 20 15 6 32 3 47 10 5 5 4 13 5 19 5 36 5 74 16 109 3 8 7 18 17 18 7-2 6-12 7-18-1-40-12-79-14-119 0-4 0-9 5-9 18-5 39 0 55-10 7-4 13-18 2-19-19-3-39 5-58 1-6-2-5-10-6-15-1-12 3-25-2-36-1-2-3-4-6-3z' fill='${fillcolor}'/>`
        `<path d='M318 803c56 0 83-32 107-32 25 0 48 32 108 32 32 0 202 3 192-23-9-25-116 9-152-9-19-10-25-12-49-16-66-10-133-9-192 0-26 4-37 9-52 19-25 16-130-19-138 6-9 25 108 24 176 23z'/>` + //base
        `<path d='M636 91c-21 0-36 17-45 34-5 11-15 19-21 30-1 7 8 9 13 7 12-2 22-12 26-23 5-12 16-21 28-22 13-2 25 8 27 20 4 13 2 28-8 37-16 17-40 24-53 44L382 655c-26 53-53 106-76 160-1 7-7 15-4 22 5 3 10-2 14-5 16-14 25-35 35-53 45-86 87-174 130-261l142-284c13-20 39-27 54-46 10-10 16-24 15-39-1-24-15-51-40-56-6-2-11-2-16-2z' fill='${fillcolor}'/>`,
      queen:
        `<path d='M244 825l-50-166 433 1-49 170-334-5z'/>` +
        `<path d='M613 716a633 633 0 0 0-403 0c13 31 16 93 16 93 101-28 272-27 372 4 0 0 2-66 15-97M195 698c122-53 313-54 436 0 12-105 50-234 122-327-54 21-134 158-180 184-37-76 35-274 63-316-47 28-146 203-175 285-43-94-33-271-34-345-32 69-73 229-78 342-81-61-109-225-131-290-12 94 9 257 23 323A907 907 0 0 1 75 374c65 155 89 202 120 324zM245 825c88 11 232 15 333 5-57-26-260-25-333-5M846 352c2-14-13-18-27-37-20 8-43 17-59 40 41-8 60 4 86-3M715 206c-5-6-2-16-40-37l-49 61c27-9 71-21 89-24M475 83c-9 0-35 4-51 12-5 12-2 48 0 77 15-25 49-67 51-89M227 155c-11-12-23-11-51-15 1 34 21 43 33 70 15-25 13-26 18-55M50 290c-13 3-14 30-19 44 16 17 31 26 44 52 14-25-9-77-25-96z'/>` +
        circle(87, 383, circlesize) +
        circle(211, 231, circlesize) +
        circle(422, 179, circlesize) +
        circle(630, 238, circlesize) +
        circle(754, 365, circlesize),
      king:
        `<path d='M289 612c23-33-7-125 0-168 11-68 101-114 113-74 14 47-43 51-60 91-14 36-11 96 18 132M587 617c-23-33 7-126 0-168-12-68-102-114-114-75-14 48 44 52 60 91 15 37 12 97-17 133M401 288c5-15 19-71 14-87-22-2-69 18-99 12-9-16-14-49-2-67 28-8 88 6 105 9 6-17-15-68-11-86 19-9 66-8 79 1 0 19-28 66-29 82 19-1 77-17 97-13 9 17 11 47-3 66-22 7-78-9-101-5-10 20 5 72 9 87'/>` +
        `<path d='M408 372c-24-22-35-22-30-75 4-46 106-44 108-2 3 52-14 55-26 81M271 830l-64-196 471-2-75 204-332-6z'/>` +
        `<path d='M643 717c-93-48-307-50-407 2 14 44 20 94 20 94 91-29 277-30 367 4 0 0 10-67 20-100M554 574c-29-16-90-54-122-55-25-1-77 33-104 53-115-52-114-153-33-171 13-3 52 0 78-1-8-23-17-39-9-69-18-12-42-20-70-22a351 351 0 0 0-25 0c-81 1-165 30-177 105-18 109 79 173 114 289 110-63 364-59 470-5 28-89 140-193 115-284-23-84-136-109-210-105-30 2-59 12-81 25 4 24-4 44-11 64 34 0 94-8 118 6 52 29 56 136-53 170z'/>` +
        `<path d='M328 573c38-27 56-80 55-123-2-62-35-72-16-126 12-37 119-39 131 1 14 47-23 76-17 124 7 56 7 93 72 127M276 833c88 10 228 12 327 2-69-28-256-28-327-2z'/>` +
        circle(330, 743, circlesize / 2) +
        circle(440, 737, circlesize / 2) +
        circle(550, 743, circlesize / 2)
    }[is.split("-")[1]]}</g></svg>`;
  return svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23");
}

[___WHITE___, ___BLACK___].map(color =>
  ["pawn", "rook", "knight", "bishop", "queen", "king"].map(piecename => {
    let piece_is = color + "-" + piecename;

    let fen = piecename == "knight" ? "n" : piecename[0];
    fen = color == ___BLACK___ ? fen : fen.toUpperCase();
    FEN_translation_Map.set(piece_is, fen);
    FEN_translation_Map.set(fen, piece_is);

    customElements.define(
      piece_is,
      class extends HTMLImageElement {
        static get observedAttributes() {
          return [___AT___, ___ELEMENT_IS___, ___ATTACKED_BY___, ___OUTLINE___];
        }
        constructor() {
          super();
          this.setAttribute(___ELEMENT_IS___, piece_is);
        }
        setIMGsrc() {
          let parameters = parametersObject(this, {}, this.constructor.observedAttributes);
          this.src = game_pieceSVG(parameters);
        }
        show_piece_moves(from_square) {
          this.moves().piece_destinations
            .filter(to_square => to_square.length == 2 || to_square[2] == "X")// empty or attacking square
            .map(to_square => {
              let square = to_square[0] + to_square[1];
              let { piece, piece_is, square_element } = this.board.squareData(square);
              if (from_square == this.at) {
                if (to_square[2] == "X") piece.attackFrom(this.at); // set image outline
                //else empty square piece can move to
                this.board.record_fromto_move(this.at, square);
              }
            })
        }
        connectedCallback() {
          this.setIMGsrc();
          this.board = this.getRootNode().host;
          this.setAttribute("draggable", "draggable");
          this.addEventListener("mouseover", event => {
            this.board.levelMoves.clear_from_moves();
            this.show_piece_moves(this.at);
          });
          this.addEventListener("dragstart", event => this.board.draggingPiece = this);
        }
        attributeChangedCallback(name, oldValue, newValue) {
          if (name == ___AT___) this._at_square = squarenameUpperCase(newValue);
          this.setIMGsrc();
        }
        get at() {
          return this._at_square;
        }
        set at(square) {
          this.setAttribute(___AT___, squarenameUpperCase(square));
        }
        attackFrom(square = false) {
          if (square && this.board.draggingPiece) this.setAttribute(___OUTLINE___, "red");
          else this.removeAttribute(___OUTLINE___);
        }
        get fen() {
          return FEN_translation_Map.get(piece_is);
        }
        get color() {
          return color;
        }
        get is() {
          return this.getAttribute(___ELEMENT_IS___);
        }
        to(square) {
          let from = this.board.square(this.at).rect;
          let to = this.board.square(square).rect;
          this.animate(
            [
              {
                /*start*/
              },
              { transform: `translate(${to.x - from.x}px,${to.y - from.y}px)` }
            ],
            { duration: 1500 }
          ).onfinish = () => (this.at = square);
        }
        moves(square = this.at) {
          let board = this.board;
          let squareData = board.squareData(square);
          let { idxFile, idxRank, piece_is, fen, playdirection } = squareData;
          let startFile = idxFile;
          let startRank = idxRank;
          let idxBorder = squarecount + 1;  // playingfield is from 1 to squarecount
          let reachableSquares = [];
          let attackMode = true;            // default , pawn sets attackmode to false for forward moves
          //let inbetweenPieces = [];
          let afterBlockingPiece = false;   // detect how far we can move
          let checksquareData = false;
          let reset = _ => {
            afterBlockingPiece = false;
            idxFile = startFile; // reset idxFile to current square
            idxRank = startRank; // reset idxRank
          };
          let recordDestination = (sqData, char, att_def_type = false) => {
            let checksquare = sqData.square;
            if (afterBlockingPiece) {
              checksquare += char; //square can't be reach directly
            } else {
              sqData.square_element[att_def_type] = square + fen;
              checksquare += char.toUpperCase();
            }
            return checksquare;
          };
          let attack_or_defend = (checksquare, noBlockingCheck) => {//call by default for all pieces AND pawn
            checksquareData = board.squareData(checksquare);
            if (checksquareData.piece) {
              if ( /* owncolor */ squareData.playdirection == checksquareData.playdirection) {
                checksquare = recordDestination(checksquareData, "z", "set_defended_By");
              } else {
                if (attackMode) {//pawns forward moves can't attack
                  checksquare = recordDestination(checksquareData, "x", "attacked_By");
                }
              }
              if (noBlockingCheck) checksquare = checksquare.toUpperCase();
              //inbetweenPieces.push(checksquareData);
              if (!noBlockingCheck) afterBlockingPiece = checksquareData;
            } else {
              if (afterBlockingPiece)
                checksquare += "z";// protected square AFTER a blocking piece
              else {
                //checksquareData.square_element.add_relationData(squareData);
                //squareData.square_element.add_relationData(checksquareData);
                checksquareData.square_element.set_protected_By(square, piece_is);
              }
            }
            reachableSquares.push(checksquare);
            return checksquare;
          };
          let add = (
            checksquare = files[idxFile - 1] + ranksAscending[idxRank - 1],
            noBlockingCheck = false
          ) => {
            if (checksquare) attack_or_defend(checksquare, noBlockingCheck);
            //else at my own square
          };
          let straights = _ => {
            while (idxRank++ < idxBorder - 1) add(); //forward
            reset();
            while (idxFile++ < idxBorder - 1) add(); //right
            reset();
            while (--idxRank) add(); //back
            reset();
            while (--idxFile) add(); //left
            reset();
            return reachableSquares;
          };
          let diagonals = _ => {
            while (++idxFile < idxBorder && ++idxRank < idxBorder) add(); //forward-right
            reset();
            while (++idxFile < idxBorder && --idxRank) add(); //backward-right
            reset();
            while (--idxFile && --idxRank) add(); //backward-left
            reset();
            while (--idxFile && ++idxRank < idxBorder) add(); //forward-left
            reset();
            return reachableSquares;
          };
          let cells = (x, addcell = true) =>
            reachableSquares.concat(
              x.map(loc => {
                let tocell = translateSquare(
                  square,/* destinationsquare */
                  playdirection * loc[0],
                  playdirection * loc[1]
                );
                let tocellData = board.squareData(tocell);
                if (addcell) add(tocell, true /* do not check for blocking pieces*/);
                return tocellData;
              })
            );

          let piece_destinations = {
            pawn: _ => {
              let attacks = cells([[-1, 1], [1, 1]], false) // diagonals moves only valid
                .filter(squareData => squareData.piece)     // when it is an attack
                .map(squareData => attack_or_defend(squareData.square, true));// true=no blocking check
              // 1 or 2 moves forward can not attack
              attackMode = false;
              afterBlockingPiece = true;
              let forward = [[0, 1]];
              if (idxRank == 2 || idxRank == 7) forward.push([0, 2]);
              let moves = cells(forward, false) // 2 cells forwars
                .filter(squareData => !(afterBlockingPiece && squareData.piece))
                .map(squareData => squareData.square);
              return [...attacks, ...moves];
            },
            rook: straights, //todo add castling
            knight: _ => cells([
              [2, -1],
              [2, 1],
              [1, 2],
              [-1, 2],
              [-2, 1],
              [-2, -1],
              [-1, -2],
              [1, -2]
            ]),
            bishop: diagonals,
            queen: _ => [...straights(), ...diagonals()],
            king: _ => cells([
              [1, -1],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, -1],
              [-1, -1],
              [-1, 0]
            ]) //todo add castling
          }
          [piece_is.split`-`[1]]().filter(square => square);

          return {
            piece_destinations
            //inbetweenPieces
          };
        }
      }, // <<< class [color]-[piece]
      { extends: "img" }
    );
  })
);

class SquareElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
  }
  connectedCallback() {
    this.board = this.getRootNode().host;
    this.reset_square();
  }
  set square(square) {
    this._square = square;
  }
  get square() {
    return this._square;
  }
  get at() {
    return this.square;//double because dragenter (img or square) wants .at
  }
  reset_square() {
    this._relations = {
      [___ATTACKED_BY___]: new Set(),
      [___DEFENDED_BY___]: new Set(),
      [___PROTECTED_BY_WHITE___]: new Set(),
      [___PROTECTED_BY_BLACK___]: new Set(),
      [___SQUARE_RELATIONS___]: new Set()
    };
    this.removeAttribute(___ATTR_FROM___);

    let piece = this.board.at(this._square);
    if (piece) {
      if (piece.length > 1) piece = piece[0];
      piece.attackFrom(false);
    }
  }
  get relations() {
    return this._relations;
  }
  set_square_relations() {
    let { piece, piece_is, square_element } = this.board.squareData(this.square);

    let setRelations = attrName => {
      let relations = [...this._relations[attrName]]; // attacked_By , set_defended_By
      let set_square_and_piece = el => {              // el is img OR square-white/square-black
        if (relations.length) {
          el.setAttribute(attrName, relations.join(","));
          el.setAttribute(attrName + "_count", relations.length);
        } else {
          el.removeAttribute(attrName);
          el.removeAttribute(attrName + "_count");
        }
      };
      set_square_and_piece(this); // square is
      if (piece) set_square_and_piece(piece); // square is
    };

    setRelations(___ATTACKED_BY___);
    setRelations(___DEFENDED_BY___);
    setRelations(___PROTECTED_BY_WHITE___);
    setRelations(___PROTECTED_BY_BLACK___);
    square_element.setAttribute(___ATTR_PIECE___, piece_is); // piece_is = 'none'
  }
  add_relationData(square) {
    //this._relations[___SQUARE_RELATIONS___].add(square);
  }
  set attacked_By(piece) {
    this._relations[___ATTACKED_BY___].add(piece);
  }
  set_protected_By(square, piece_is) {
    let piece_color = piece_is.split('-')[0];
    this._relations[___PROTECTED_BY___ + '_' + piece_color].add(square);
  }
  set set_defended_By(piece) {
    this._relations[___DEFENDED_BY___].add(piece);
  }
  get piece() {
    let rect = this.getBoundingClientRect();
    let x = rect.left + rect.width / 2;
    let y = rect.top + rect.height / 2;
    return this.board.at(this._square);
    //return [...document.elementsFromPoint(x, y)];//.filter(el => el.nodeName.includes('img'));
  }
}
customElements.define("square-white", class extends SquareElement { });
customElements.define("square-black", class extends SquareElement { });

let gridrepeat = gap => `repeat(${squarecount}, ${(100 - (squarecount - 1) * gap) / squarecount}%)`;
let cssgrid = gap =>
  `position:absolute;width:100%;height:100%;box-sizing: border-box;` +
  `display:grid;grid-gap:${gap};grid-template-columns:${gridrepeat(gap)};grid-template-rows:${gridrepeat(gap)};` +
  `grid-template-areas: ${'"' + chunk([...all_board_squares], squarecount).join('" "').replace(/,/g, " ") + '"'};` +
  `grid-auto-flow:row`;

let game_css =
  `<style>:root {display:block;}` +
  `*{box-sizing:border-box;}` +
  `#board{position:relative;border:10px solid black;width:100%;max-width:90vh;margin:0 auto;}` +
  `#board:after{content:"";display:block;padding-bottom:100%}` +// square sized board
  //only Chrome does conic-gradient to create a checkboard layout:
  //+ `#board{--sqblack:var(--,#b58863);--sqwhite:var(--${___SQUAREWHITE___},#00d9b5);--sqempty:green;}`
  //+ `#board{background:conic-gradient(var(--sqblack) 0.25turn, var(--sqwhite) 0.25turn 0.5turn, var(--sqblack) 0.5turn 0.75turn, var(--sqwhite) 0.75turn) top left/25% 25% repeat}`
  `#board square-white{background-color:var(--${___SQUAREBLACK___},#f0e9c5)}` +
  `#board square-black{background-color:var(--${___SQUAREBLACK___},#b58863)}` +
  //create grid-area for every square name (A1 to H8)
  `${all_board_squares.map(square => `[at=${square}]{grid-area:${square}}`).join("")}` +

  `board-level{${cssgrid(0)}}` +
  `square-white:not([at]),square-black:not([at]){border:1px solid red}` + // extra warning for squares without a piece
  `#squares >*[piece="none"]:before{z-index:1;display:block;content:attr(at);position:relative;text-align:center;top:40%;color:var(--squarecolor,black);font-family:arial}` + //cell File/Rank text

  `#moves >*[from]{width:90%;height:90%;margin:5%;border:6px dashed darkgreen}` +
  //  `#moves >*:not([piece="none"]){border-color:red}` +

  `.rotated,.rotated img{transform:rotate(180deg)}` +
  `img:not([at]){background:red;}` +//debug
  `img[at]{width:100%;z-index:11}` +

  `#board{--dropsize:var(--chessly_dropshadow_size,6px)}` +
  `</style>` +

  `<style id=attack_and_defend_dropshadow>` +
  `#pieces{--swa:drop-shadow(var(--dropsize) 0px 1px darkred);--swd:drop-shadow(calc(-1*var(--dropsize)) 0px 1px darkgreen)}` +
  // you can't set :before and :after on IMG elements!
  /* */ `#pieces img[attackers][defenders]{filter:var(--swa) var(--swd)}` +
  /* */ `#pieces img[attackers]:not([defenders]){filter:var(--swa)}` +
  /* */ `#pieces img[defenders]:not([attackers]){filter:var(--swd)}` +

  /* Attacked piece without defenders */ `#pieces img[attackers]:not([defenders]){` +
  `--len:4px;--col:red;` +
  `filter:drop-shadow(var(--dropsize) 0px 1px red) drop-shadow(calc(-1*var(--dropsize)) 0px 1px red);` +
  `</style>` +

  `<style id=attack_and_defend_counters>` +
  /* */ `#squares [attackers]:before{z-index:1;content:attr(defenders_count)"-"attr(attackers_count);text-align:center;display:block;position:relative;width:100%;height:100%}` +
  /* */ `#squares [defenders]:not([attackers]):after{z-index:1;content:" " attr(defenders_count);text-align:left;display:block;position:relative;width:100%;height:100%}` +
  `</style>`;

customElements.define("board-level", class extends HTMLElement {
  static get observedAttributes() {
    return [];
  }
  constructor() {
    super();
    this._squares_marked_from = new Set();
  }
  connectedCallback() {
  }
  clear_level() {
    this.innerHTML = "";
    this.clear_from_moves();
  }
  from_to(from_square, to_square) {
    this._squares_marked_from.add(to_square);
    this.squares(to_square).setAttribute(___ATTR_FROM___, from_square);
  }
  clear_from_moves() {
    this._squares_marked_from.forEach(square => this.squares(square).removeAttribute(___ATTR_FROM___));
    this._squares_marked_from.clear();
  }
  levelHTML(filterFunc = (element, squareData) => {
    element.setAttribute(___ATTR_PIECE___, squareData.piece_is);
    element.addEventListener("dragenter", dragenter_event);
    return true
  }) {
    let board = this.getRootNode().host;
    this.clear_level();
    let squares = all_board_squares.map(square => {
      let squareData = board.squareData(square);
      let { idxFile, idxRank } = squareData;
      let squarecolor = [___BLACK___, ___WHITE___][~~(isOdd(idxFile) ^ isOdd(idxRank))];
      let element = document.createElement("square-" + squarecolor);
      element.square = square;
      element.setAttribute(___AT___, square);
      //filterFunc callback (default:true) determines if a square HTML is actually added
      if (filterFunc(element, squareData)) return element;
      else return false;
    });
    this.append(...squares);
    return this; //chaining
  }
  squares(selector = "*") {
    // get one or more pieces from the board
    // squares('E2') square/piece at E2
    // squares('E') all in column E
    // squares('2') all in row 2
    if (selector != "*") selector = `[at*="${selector}" i]`;
    let elements = [...this.querySelectorAll(selector)];
    // returns:
    // Array of elements
    // first/only element
    // false
    return elements.length > 1
      ? elements
      : elements.length
        ? elements[0]
        : false;
  }
  add_board_level_piece(piece_is, square, append = true) {
    if (square && append) {
      let piece = document.createElement("img", { is: piece_is });
      //if (this.id == ___ID_SQUARES___)
      piece.addEventListener("dragenter", dragenter_event);
      piece.setAttribute(___AT___, (square = squarenameUpperCase(square)));
      return this.appendChild(piece);
    } else {
      this.insertAdjacentHTML("beforeend", `<img is=${piece_is} at=${square}>`);
    }
  }
});
customElements.define(
  "game-board",
  class extends HTMLElement {
    static get observedAttributes() {
      return ["fen", ___SQUAREWHITE___, ___SQUAREBLACK___];
    }
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      let initialpieces_lightDOM = this.innerHTML;
      this.innerHTML = ""; //clear lightDOM
      this.shadowRoot.innerHTML = game_css + `<div id=board></div>`;
      this.board = this.shadowRoot.querySelector("#board");
      this.levelSquares = this.addlevel(___ID_SQUARES___); //default 64 empty squares
      this.levelMoves = this.addlevel("moves"); //default 64 empty squares
      this.level_dragpiece = this.addlevel("dragpiece");
      this.levelPieces = this.addlevel("pieces");
      this.levelPieces.innerHTML = initialpieces_lightDOM;
    }
    connectedCallback() {
      //once the pieces are on the board, calc underlying levels
      this.levelSquares.levelHTML(); // shows cell numbers for empty fields
      this.levelMoves.levelHTML(() => true); // shows cell numbers for empty fields

      this.board.addEventListener("dragend", event => {
        this.board.draggingPiece = false;
        let piece = this.at(event.target.at);
        if (piece.length > 1) piece[0].remove();
        event.target.board.showmoves();
      });
    }
    addlevel(id) {
      let level = document.createElement("board-level");
      level.id = id;//used by CSS
      return this.board.appendChild(level);
    }
    add_board_piece(piece_is, square, level = this.levelPieces) {
      if (all_board_squares.includes(square)) level.add_board_level_piece(piece_is, square);
    }
    at(square) {
      return this.levelPieces.squares(square);
    }
    showmoves(from_square) {
      let board_squares = this.levelSquares.squares();//get all 64 board squares
      board_squares.map(square_element => square_element.reset_square());// reset level
      this.levelMoves.clear_from_moves();
      [...this.levelPieces.children].map(piece => {
        piece.show_piece_moves(from_square);
      });
      //loop all squares updating this.board.levelSquares with correct attribute data
      board_squares.map(square_element => square_element.set_square_relations());
    }
    get fen() {
      //todo move fen to level for multiple pieces level
      let fen = "",
        empty = 0;
      let addempties = _ => (
        empty             // if counted empties
          ? empty         // return empties n
          : "",           // else no empties (empty string in fen)
        (empty = 0)       // always reset empty count
      );
      let add = char => (fen += addempties() + char); // add new FEN character,including counting empties
      this.levelSquares.children.map((sq, idx) => {   // loop all squares
        if (idx && !(idx % squarecount)) add("/");    // if new rank(row) add a /
        if (sq.piece) add(sq.piece.fen);              // if piece in this square add fen character
        else empty++;                                 // else count empties
      });
      fen += addempties();                            // add remaining empties
      return fen;
    }
    set fen(fen) {
      this.levelPieces.clear_level();
      fen.split("/").map((rank, idx) => {
        rank.split``.map(
          fen => fen == Number(fen)         // number
            ? ___EMPTYSQUARE___.repeat(fen) // then add number empty squares
            : fen                           // else fen character
        ).join``.split``.map((fen, file) => {
          // join everything to one string (the repeat took 1 array position)
          // and split again so we get 64 values
          let piece_is = FEN_translation_Map.get(fen);
          let square = files[file % squarecount] + ranks[idx % squarecount];
          if (piece_is) this.add_board_piece(piece_is, square);
        });
      });
      //once the pieces are on the board, calc underlying levels
      this.levelSquares.levelHTML();
      this.showmoves();
    }
    game(nr) {
      this.fen = games[nr].fen;
    }
    record_fromto_move(from_square, to_square) {
      this.levelSquares.from_to(from_square, to_square);
      this.levelMoves.from_to(from_square, to_square);
    }

    move(sq1, sq2) {
      let piece = this.at(sq1);
      if (piece) piece.to(sq2);
    }
    rotate() {
      this.board.classList.toggle("rotated");
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name == "fen") this.fen = newValue;
      else if (name == ___SQUAREWHITE___)
        this.style.setProperty("--" + ___SQUAREWHITE___, newValue);
      else if (name == ___SQUAREBLACK___)
        this.style.setProperty("--" + ___SQUAREBLACK___, newValue);
    }
    squareData(fensquare) {
      let file = fensquare[0];
      let rank = fensquare[1];
      let square = file + rank;
      let idxFile = files.indexOf(file) + 1; // 1 to 8
      let idxRank = ranksAscending.indexOf(rank) + 1; // 1 to 8
      let piece_is = "none";
      let playdirection = false;
      let piece = this.levelPieces && this.at(square);
      if (piece.length > 1) piece = piece[0];
      let square_element = this.levelSquares.squares(square);
      if (piece) {
        piece_is = piece.is;
        playdirection = piece_is.includes(___WHITE___) ? 1 : -1;
      }
      return {
        board: this.board,
        square,     // A1 to H8
        file,       // A  H
        rank,       // 1  8
        idxFile,    // A=1 H=8
        idxRank,    // 1, .. , 8
        piece,      // false OR DOM element <img is='white-queen'>
        piece_is,   // white-queen
        square_element, // <white-square> or <black-square>
        fen: FEN_translation_Map.get(piece_is),
        playdirection
      };
    }
  }
);
let board = document.querySelector("game-board");
board.fen = "4rrk1/1b2b2p/ppn5/3p1pnq/1P1N2p1/P1PB2P1/5PNP/R1BQ1RK1";
//board.fen = '8/2R5/5q1k/3Q2N1/3p4/PP3pPP/5n1K/4r3';
//board.add_board_piece("white-queen", "E4");
