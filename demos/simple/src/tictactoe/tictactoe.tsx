import "./tictactoe.scss"

import { Act, Events, Proton } from "@denshya/proton"

function Square({ value, onClick }) {
  return (
    <button className="square" on={{ click: onClick }}>{value.to(it => it ?? "")}</button>
  )
}

function Board(props: { xIsNext, squares, onPlay }) {
  function onClick(index: number) {
    const squares = props.squares.get()

    if (calculateWinner(squares) || squares[index]) {
      return
    }
    const nextSquares = squares.slice()
    if (props.xIsNext.get()) {
      nextSquares[index] = 'X'
    } else {
      nextSquares[index] = 'O'
    }
    props.onPlay(nextSquares)
  }


  const status = props.xIsNext.to(it => {
    const squares = props.squares.get()
    const winner = calculateWinner(squares)

    if (winner) {
      return 'Winner: ' + winner
    }

    return 'Next player: ' + (it ? 'X' : 'O')
  })

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={props.squares.$[0]} onClick={() => onClick(0)} />
        <Square value={props.squares.$[1]} onClick={() => onClick(1)} />
        <Square value={props.squares.$[2]} onClick={() => onClick(2)} />
      </div>
      <div className="board-row">
        <Square value={props.squares.$[3]} onClick={() => onClick(3)} />
        <Square value={props.squares.$[4]} onClick={() => onClick(4)} />
        <Square value={props.squares.$[5]} onClick={() => onClick(5)} />
      </div>
      <div className="board-row">
        <Square value={props.squares.$[6]} onClick={() => onClick(6)} />
        <Square value={props.squares.$[7]} onClick={() => onClick(7)} />
        <Square value={props.squares.$[8]} onClick={() => onClick(8)} />
      </div>
    </>
  )
}

export default function Game() {
  const history = new Events.State([Array(9).fill(null)])
  const currentMove = new Events.State(0)

  const xIsNext = currentMove.to(it => it % 2 === 0)
  const currentSquares = currentMove.to(it => history.get()[it])

  function onPlay(nextSquares) {
    const nextHistory = [...history.get().slice(0, currentMove.get() + 1), nextSquares]

    history.set(nextHistory)
    currentMove.set(nextHistory.length - 1)
  }

  function jumpTo(nextMove) {
    currentMove.set(nextMove)
  }

  // const moves = history.map((squares, move) => {
  //   let description
  //   if (move > 0) {
  //     description = 'Go to move #' + move
  //   } else {
  //     description = 'Go to game start'
  //   }
  //   return (
  //     <li>
  //       <button on={{ click: () => jumpTo(move) }}>{description}</button>
  //     </li>
  //   )
  // })

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={onPlay} />
      </div>
      {/* <div className="game-info">
        <ol>{moves}</ol>
      </div> */}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}
