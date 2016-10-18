'use strict';

var weapons = [['antique carved loon', 7], ['shillelagh', 12], ['cutting remarks', 16], ['blunderbuss', 22], ['anaconda bazooka', 30]],
    initState = { rows: 50, cols: 100, smallestRmDm: 6, biggestRmDm: 20, cellVals: [], openSpaces: [], playerPos: [], health: 100,
  weapon: 'swizzle stick', attack: 7, level: 0, nextLevel: 60, dungeon: 0, numRooms: 8, bossHealth: 200,
  shadowed: true };

var Dungeon = React.createClass({
  displayName: 'Dungeon',

  getInitialState: function getInitialState() {
    return initState;
  },

  resetState: function resetState(result) {
    this.setState(initState);
    //we replace the message node to make it re-render
    var msg = document.getElementById('message');
    msg.innerHTML = result == 'win' ? 'You won!' : 'You lost!';
    var newmsg = msg.cloneNode(true);
    msg.parentNode.replaceChild(newmsg, msg);
    //lamp goes off automatically
    document.getElementById('lamp').className = 'off';
  },

  randomDim: function randomDim() {
    return Math.floor(Math.random() * (this.state.biggestRmDm - this.state.smallestRmDm) + this.state.smallestRmDm);
  },

  randomDamage: function randomDamage() {
    return (this.state.dungeon + 1) * 10 + Math.floor(Math.random() * 5) - 2;
  },

  //outcome for a battle with an enemy/the final boss
  battleWin: function battleWin() {
    return Math.round(Math.random() * (5 / 8) + this.state.attack / 200 + this.state.level / 25);
  },

  bossWin: function bossWin() {
    this.setState({ bossHealth: this.state.bossHealth - this.state.attack * this.state.level / 10 - Math.round(Math.random() * 20) });
    return this.state.bossHealth < 0 ? 1 : 0;
  },

  clickLamp: function clickLamp() {
    document.getElementById('lamp').className = this.state.shadowed ? 'on' : 'off';
    this.setState({ shadowed: !this.state.shadowed });
  },

  newRoom: function newRoom(oldOpen, oldVals, count) {
    var found = false,
        works = true,
        newVals = oldVals,
        newOpen = oldOpen,
        wallRow,
        wallCol,
        side,
        toprow,
        bottomrow,
        leftcol,
        rightcol;
    var rmWidth = this.randomDim(),
        rmHeight = this.randomDim(),
        extra = Math.floor(Math.random() * Math.min(rmWidth, rmHeight));

    var tester = document.getElementById('testerbox');

    //finds an open space next to a closed one--the new hallway
    while (!found) {
      var wallPos = Math.floor(Math.random() * newOpen.length);
      var right = [newOpen[wallPos][0], newOpen[wallPos][1] + 1],
          left = [newOpen[wallPos][0], newOpen[wallPos][1] - 1],
          top = [newOpen[wallPos][0] - 1, newOpen[wallPos][1]],
          bottom = [newOpen[wallPos][0] + 1, newOpen[wallPos][1]];

      if (newVals[right[0]][right[1]] == 0) {
        wallRow = right[0];
        wallCol = right[1];
        side = 'right';

        found = true;
      } else if (newVals[left[0]][left[1]] == 0) {
        wallRow = left[0];
        wallCol = left[1];
        side = 'left';

        found = true;
      } else if (newVals[top[0]][top[1]] == 0) {
        wallRow = top[0];
        wallCol = top[1];
        side = 'top';

        found = true;
      } else if (newVals[bottom[0]][bottom[1]] == 0) {
        wallRow = bottom[0];
        wallCol = bottom[1];
        side = 'bottom';

        found = true;
      }
    }

    //prepares a new room with the randomized dimensions from earlier
    switch (side) {
      case 'top':
        toprow = wallRow - rmHeight - 1;
        bottomrow = wallRow - 1;
        leftcol = wallCol - extra;
        rightcol = wallCol + rmWidth - extra;

        break;
      case 'bottom':
        toprow = wallRow + 1;
        bottomrow = wallRow + rmHeight + 1;
        leftcol = wallCol - extra;
        rightcol = wallCol + rmWidth - extra;

        break;
      case 'left':
        toprow = wallRow - extra;
        bottomrow = wallRow + rmHeight - extra;
        leftcol = wallCol - rmWidth - 1;
        rightcol = wallCol - 1;

        break;
      case 'right':
        toprow = wallRow - extra;
        bottomrow = wallRow + rmHeight - extra;
        leftcol = wallCol + 1;
        rightcol = wallCol + rmWidth + 1;

        break;
    }

    //checks that the new room does not go beyond the field or intersect another room/hallway
    if (toprow > 0 && bottomrow < this.state.rows - 1 && leftcol > 0 && rightcol < this.state.cols - 1) {
      for (var i = toprow - 1; i <= bottomrow + 1; i++) {
        for (var j = leftcol - 1; j <= rightcol + 1; j++) {
          if (newVals[i][j] != 0) {
            works = false;
          }
        }
      }
    } else {
      works = false;
    }

    //empties out the new room (if it's passed the previous tests)
    if (works) {
      for (var i = toprow; i <= bottomrow; i++) {
        for (var j = leftcol; j <= rightcol; j++) {
          newVals[i][j] = 1;
          newOpen.push([i, j]);
        }
      }
      newVals[wallRow][wallCol] = 1;
      newOpen.push([wallRow, wallCol]);
      count++;
      return [newOpen, newVals, count];
    }
    return [oldOpen, oldVals, count];
  },

  initDungeon: function initDungeon() {
    var initDungeon = [],
        rows = this.state.rows,
        cols = this.state.cols;
    //all values are initially closed (0)
    for (var i = 0; i < rows; i++) {
      var thisrow = [];
      for (var j = 0; j < cols; j++) {
        thisrow.push(0);
      }
      initDungeon.push(thisrow);
    }

    //make center room
    var rmHeight = this.randomDim(),
        rmWidth = this.randomDim();
    var starth = Math.round(rows / 2) - Math.round(rmHeight / 2),
        startw = Math.round(cols / 2) - Math.round(rmWidth / 2);
    var newOpen = [];
    for (var _i = starth; _i < starth + rmHeight; _i++) {
      for (var _j = startw; _j < startw + rmWidth; _j++) {
        initDungeon[_i][_j] = 1;
        newOpen.push([_i, _j]);
      }
    }

    //make other rooms
    var count = 1;
    while (count < this.state.numRooms) {
      var _newRoom = this.newRoom(newOpen, initDungeon, count);

      newOpen = _newRoom[0];
      initDungeon = _newRoom[1];
      count = _newRoom[2];
    }

    //put player, weapon, portal, enemies, healths in at random
    var items = [2, 3, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 4];
    if (this.state.dungeon == 4) items.splice(12, 1, 7);
    var playerPos;
    for (var _i2 = 0; _i2 < items.length; _i2++) {
      //for the boss (2x2 square)
      if (items[_i2] == 7) {
        var found = false;
        while (!found) {
          var _itemPos = Math.floor(Math.random() * newOpen.length);
          var bl = [newOpen[_itemPos][0], newOpen[_itemPos][1]],
              br = [newOpen[_itemPos][0], newOpen[_itemPos][1] + 1],
              tl = [newOpen[_itemPos][0] - 1, newOpen[_itemPos][1]],
              tr = [newOpen[_itemPos][0] - 1, newOpen[_itemPos][1] + 1];
          if (initDungeon[br[0]][br[1]] == 1 && initDungeon[tl[0]][tl[1]] == 1 && initDungeon[tr[0]][tr[1]] == 1) {
            var _ref = [7, 7, 7, 7];
            initDungeon[bl[0]][bl[1]] = _ref[0];
            initDungeon[br[0]][br[1]] = _ref[1];
            initDungeon[tl[0]][tl[1]] = _ref[2];
            initDungeon[tr[0]][tr[1]] = _ref[3];

            found = true;
          }
        }
      }
      //everything else (1x1 square)
      else {
          var itemPos = Math.floor(Math.random() * newOpen.length);
          initDungeon[newOpen[itemPos][0]][newOpen[itemPos][1]] = items[_i2];
          if (items[_i2] == 2) playerPos = [newOpen[itemPos][0], newOpen[itemPos][1]];
          newOpen.splice(itemPos, 1);
        }
    }

    this.setState({ openSpaces: newOpen, cellVals: initDungeon, playerPos: playerPos });
  },

  movePlayer: function movePlayer(ver, hor) {
    var row = this.state.playerPos[0],
        col = this.state.playerPos[1],
        newGrid = this.state.cellVals;
    if (newGrid[row + ver][col + hor] != 0) {
      var newStates = { cellVals: newGrid, playerPos: [row + ver, col + hor] };
      var flag = true;

      switch (newGrid[row + ver][col + hor]) {
        case 3:
          //weapon
          newStates.weapon = weapons[this.state.dungeon][0];
          newStates.attack = this.state.attack + weapons[this.state.dungeon][1];
          break;
        case 4:
          //portal
          flag = false;
          newStates = {};
          this.setState({ dungeon: this.state.dungeon + 1 });
          this.initDungeon();
          break;
        case 5: //enemy
        case 7:
          //boss
          if (newGrid[row + ver][col + hor] == 5 ? this.battleWin() : this.bossWin()) {
            var xp = (this.state.dungeon + 1) * 10;
            //if the player's won against the big boss, a new game starts
            if (newGrid[row + ver][col + hor] == 7) {
              newStates = {};
              this.resetState('win');
              this.initDungeon();
            }
            //levelling up
            else if (this.state.nextLevel <= xp) {
                newStates.level = this.state.level + 1;
                newStates.nextLevel = (newStates.level + 1) * 60 - (xp - this.state.nextLevel);
              } else {
                newStates.nextLevel = this.state.nextLevel - xp;
              }
          } else {
            flag = false;
            var damage = this.randomDamage();
            //if the player's health is <=0, a new game starts
            if (this.state.health < damage) {
              newStates = {};
              this.resetState('loss');
              this.initDungeon();
            } else {
              newStates = { health: this.state.health - damage };
            }
          }
          break;
        case 6:
          //health
          newStates.health = this.state.health + 20;
          break;
        default:
          break;
      }

      //if the player is going into a portal/hasn't killed an enemy, player doesn't move
      if (flag) {
        newGrid[row][col] = 1;
        newGrid[row + ver][col + hor] = 2;
      }
      this.setState(newStates);
    }
  },

  //detects the player's arrow key inputs
  arrowMove: function arrowMove(e) {
    e.preventDefault();
    switch (e.which) {
      case 37:
        //left
        this.movePlayer(0, -1);
        break;
      case 38:
        //up
        this.movePlayer(-1, 0);
        break;
      case 39:
        //right
        this.movePlayer(0, 1);
        break;
      case 40:
        //down
        this.movePlayer(1, 0);
        break;
      default:
        break;
    }
  },

  componentWillMount: function componentWillMount() {
    this.initDungeon();
  },

  componentDidMount: function componentDidMount() {
    window.addEventListener('keydown', this.arrowMove);
  },

  render: function render() {
    return React.createElement(
      'div',
      { className: 'wrapper' },
      React.createElement(
        'div',
        { id: 'message' },
        'Kill the boss in Dungeon 4!'
      ),
      React.createElement(Header, { h: this.state.health, w: this.state.weapon, a: this.state.attack, l: this.state.level, n: this.state.nextLevel,
        d: this.state.dungeon, onClickLamp: this.clickLamp }),
      React.createElement(DrawDungeon, { cellVals: this.state.cellVals, playerPos: this.state.playerPos, shadowed: this.state.shadowed })
    );
  }
});

var DrawDungeon = React.createClass({
  displayName: 'DrawDungeon',

  render: function render() {
    var sampleRow = React.createElement(DungeonRow, { cellVals: this.props.cellVals, playerPos: this.props.playerPos, shadowed: this.props.shadowed });
    var rows = this.props.cellVals.map(function (thisrow, rowindex) {
      return React.cloneElement(sampleRow, { thisrow: thisrow, rowindex: rowindex });
    });

    return React.createElement(
      'div',
      { className: 'dungeon' },
      rows
    );
  }
});

var DungeonRow = React.createClass({
  displayName: 'DungeonRow',

  render: function render() {
    var sampleCell = React.createElement(Cell, { cellVals: this.props.cellVals, row: this.props.rowindex, playerPos: this.props.playerPos,
      shadowed: this.props.shadowed });
    var cells = this.props.thisrow.map(function (thiscol, colindex) {
      return React.cloneElement(sampleCell, { col: colindex });
    });

    return React.createElement(
      'div',
      { className: 'dungeon-row' },
      cells
    );
  }
});

var Cell = React.createClass({
  displayName: 'Cell',

  render: function render() {
    var colorRef = { 0: 'wall', 1: 'empty', 2: 'player', 3: 'weapon', 4: 'portal', 5: 'enemy', 6: 'health', 7: 'boss' };
    var val = this.props.cellVals[this.props.row][this.props.col];
    if (this.props.shadowed) {
      var ydist = Math.abs(this.props.playerPos[0] - this.props.row),
          xdist = Math.abs(this.props.playerPos[1] - this.props.col);
      if (xdist + ydist > 9 || xdist > 6 || ydist > 6) val = 0;
    }
    return React.createElement('div', { className: 'cell ' + colorRef[val] });
  }
});

var Header = React.createClass({
  displayName: 'Header',

  render: function render() {
    return React.createElement(
      'div',
      { className: 'header' },
      React.createElement(
        'div',
        { className: 'title' },
        React.createElement(
          'strong',
          null,
          'Dungeon Crawler'
        )
      ),
      React.createElement(
        'div',
        null,
        'Health: ',
        React.createElement(
          'strong',
          null,
          this.props.h
        )
      ),
      React.createElement(
        'div',
        null,
        'Weapon: ',
        React.createElement(
          'strong',
          null,
          this.props.w
        )
      ),
      React.createElement(
        'div',
        null,
        'Attack: ',
        React.createElement(
          'strong',
          null,
          this.props.a
        )
      ),
      React.createElement(
        'div',
        null,
        'Level: ',
        React.createElement(
          'strong',
          null,
          this.props.l
        )
      ),
      React.createElement(
        'div',
        null,
        'Next Level: ',
        React.createElement(
          'strong',
          null,
          this.props.n
        )
      ),
      React.createElement(
        'div',
        null,
        'Dungeon: ',
        React.createElement(
          'strong',
          null,
          this.props.d
        )
      ),
      React.createElement(
        'div',
        { id: 'lamp', className: 'off', onClick: this.props.onClickLamp },
        React.createElement('i', { className: 'fa fa-lightbulb-o fa-lg' })
      )
    );
  }
});

ReactDOM.render(React.createElement(Dungeon, null), document.getElementById('app'));