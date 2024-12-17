import React, { useCallback, useEffect, useRef, useState } from 'react'

const GAME_HEIGHT = 600
const GAME_WIDTH = 1100
const CARPET_SIZE = 100
const WEAPON_SIZE = 40
const INITIAL_SPEED = 8
const SPEED_INCREMENT = 0.001
const SPAWN_RATE = 0.04

const Game = () => {
    const [carpetPosition, setCarpetPosition] = useState({x: 80, y: GAME_HEIGHT/2});
    const [weapons, setWeapons] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0)
    const [isMovingUp, setIsMovingUp] = useState(false)
    const [isMovingDown, setIsMovingDown] = useState(false)
    const [speed, setSpeed] = useState(INITIAL_SPEED)
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [isPaused, setIsPaused] = useState(false);

    const gameLoogRef = useRef(null)
    const audioRef = useRef( null)

    useEffect(()=>{
        audioRef.current = new Audio('/bg.mp3')
        audioRef.current.loop = true;
        // const startMusic = () => {
        //     audioRef.current.play()
        //     document.removeEventListener('keydown', startMusic)
        // }
        // document.addEventListener('keydown', startMusic)
        return ()=>{
            if(audioRef.current){
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    },[])

    useEffect(()=>{
        if(gameOver || !isGameStarted || isPaused) return
        gameLoogRef.current = setInterval(() => {
            setScore(prev => prev + 1 )
            setSpeed(prev => prev + SPEED_INCREMENT)
            setWeapons(prev => {
                const filtered = prev.filter(weapon => weapon.x > -WEAPON_SIZE)
                const moved = filtered.map(weapon => ({
                    ...weapon,
                    x: weapon.x - speed, 
                    rotation: weapon.rotation + 5
                }))
                if(Math.random() < SPAWN_RATE){
                    moved.push({
                        x: GAME_WIDTH,
                        y: Math.random() * (GAME_HEIGHT - WEAPON_SIZE),
                        rotation: 0
                    })
                }

                for (const weapon of moved) {
                    const HORIZONTAL_PADDING = 10; // Adjusted for closer collisions
                    const VERTICAL_PADDING = 10; // Adjusted for closer collisions
                
                    const carpetBox = {
                        left: carpetPosition.x + HORIZONTAL_PADDING,
                        right: carpetPosition.x + CARPET_SIZE - HORIZONTAL_PADDING,
                        top: carpetPosition.y + VERTICAL_PADDING,
                        bottom: carpetPosition.y + CARPET_SIZE - VERTICAL_PADDING,
                    };
                
                    const weaponBox = {
                        left: weapon.x + 10,
                        right: weapon.x + WEAPON_SIZE - 10,
                        top: weapon.y + 10,
                        bottom: weapon.y + WEAPON_SIZE - 10,
                    };
                
                    // Check for collision
                    if (
                        carpetBox.left < weaponBox.right &&
                        carpetBox.right > weaponBox.left &&
                        carpetBox.top < weaponBox.bottom &&
                        carpetBox.bottom > weaponBox.top
                    ) {
                        const overlapX = Math.max(0, Math.min(carpetBox.right, weaponBox.right) - Math.max(carpetBox.left, weaponBox.left));
                        const overlapY = Math.max(0, Math.min(carpetBox.bottom, weaponBox.bottom) - Math.max(carpetBox.top, weaponBox.top));
                
                        // Trigger game over if the overlap is significant (adjust threshold as needed)
                        if (overlapX > 5 && overlapY > 5) {
                            setGameOver(true);
                            if (audioRef.current) {
                                audioRef.current.pause();
                            }
                            break;
                        }
                    }
                }
                
                

                return moved;

            })
        }, 1000/60);
        return () => {
            if(gameLoogRef.current){
                clearInterval(gameLoogRef.current)
            }
        }
    },[gameOver, speed, isGameStarted, isPaused])

    const handleKeyDown = useCallback((e)=>{
        if(e.key === 'ArrowUp') setIsMovingUp(true)
        if(e.key === 'ArrowDown') setIsMovingDown(true)
    })

    const handleKeyUp = useCallback((e)=>{
        if(e.key === 'ArrowUp') setIsMovingUp(false)
        if(e.key === 'ArrowDown') setIsMovingDown(false)
    })

    const resetGame = ()=>{
        setWeapons([])
        setCarpetPosition({x: 80, y: GAME_HEIGHT/2})
        setGameOver(false)
        setScore(0)
        setSpeed(INITIAL_SPEED)
        setIsGameStarted(true)
        setIsPaused(false);
        if(audioRef.current){
            audioRef.current.currentTime = 0
            audioRef.current.play()
        }
    }
    const togglePause = () => {
        setIsPaused(prev => !prev);
        if (audioRef.current) {
            if (!isPaused) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    const startGame = () => {
        setIsGameStarted(true)
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play()
        }
    }

    useEffect(()=>{
        if(gameOver || !isGameStarted || isPaused) return
        const moveInterval = setInterval(() => {
            setCarpetPosition((prev)=>{
                let newY = prev.y
                const MOVE_SPEED = 10
                if(isMovingUp){
                    newY = Math.max(0, prev.y - MOVE_SPEED)
                }
                if(isMovingDown){
                    newY = Math.min(GAME_HEIGHT - CARPET_SIZE, prev.y + MOVE_SPEED)
                }
                return {...prev, y: newY}
            })
        }, 16);
        return ()=> clearInterval(moveInterval)
    },[isMovingDown, isMovingUp, gameOver, isGameStarted, isPaused])

    useEffect(()=>{
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () =>{
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    },[handleKeyDown, handleKeyUp])

  return (
    <>
    <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Merienda:wght@400;700&display=swap');
          
        `}
    </style>
    <div className="flex relative flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
    {!isGameStarted && !gameOver && (
        <div className="text-center absolute top-44 z-10 text-white p-2 bg-purple-900 rounded-lg shadow-2xl">
            <h4 className=" sm:text-4xl font-bold mb-1">Welcome to the Game!</h4>
            <button 
                className="px-3 py-2 bg-yellow-400 rounded-md text-purple-900 text-lg sm:text-xl font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                onClick={startGame}
            >
                Start Game
            </button>
        </div>
    )}
        <div 
            className="relative w-full max-w-5xl h-[60vw] max-h-[600px] overflow-hidden rounded-lg shadow-2xl border-4 border-yellow-400"
            style={{
                backgroundImage: "url('https://img.freepik.com/premium-vector/muslim-city-buildings_18591-72466.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: `${-score}px 0`
            }}
        >   
            {/* Score Display */}
            {isGameStarted && (
                <div className="absolute flex flex-col top-4 right-4 text-lg sm:text-2xl font-bold text-white bg-purple-900 bg-opacity-75 p-2 sm:p-3 rounded-lg">
                    Score: {score}
                    <button 
                        className="mt-2 px-2 py-1 text-purple-900 text-sm sm:text-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                        onClick={togglePause}
                    >
                        {isPaused ? "▶" : "⏸"}
                    </button>
                </div>
            )}

            {/* Aladdin on the Carpet */}
            {isGameStarted && !gameOver && (
                <div 
                    className="absolute transition-all duration-100"
                    style={{
                        transform: `translate(${carpetPosition.x}px, ${carpetPosition.y}px)`,
                        width: `${CARPET_SIZE}px`,
                        height: `${CARPET_SIZE}px`,
                    }}
                >
                    <div className="relative w-full h-full">
                        <img 
                            src="https://media.tenor.com/WsRClBipMacAAAAi/santosh-dawar-aladdin.gif" 
                            alt="Aladdin" 
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Weapons */}
            {isGameStarted && weapons.map((weapon, index) => (
                <div
                    key={index}
                    className="absolute"
                    style={{
                        transform: `translate(${weapon.x}px, ${weapon.y}px) rotate(${weapon.rotation}deg)`,
                        width: `${WEAPON_SIZE}px`,
                        height: `${WEAPON_SIZE}px`,
                    }}
                >
                    <img 
                        src="https://nicolaoveragdd.wordpress.com/wp-content/uploads/2014/11/sprites-rock.png" 
                        alt="Weapon"
                        className="w-full h-full object-contain animate-spin"
                    />
                </div>
            ))}

            {/* Game Over Modal */}
            {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white p-4 sm:p-8 bg-purple-900 rounded-lg shadow-2xl">
                        <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Game Over!</h2>
                        <p className="text-xl sm:text-2xl mb-4 sm:mb-6">Final Score: {score}</p>
                        <button 
                            className="px-4 sm:px-6 py-2 sm:py-3 rounded-md bg-yellow-400 text-purple-900 text-lg sm:text-xl font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                            onClick={resetGame}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {isGameStarted && !gameOver && (
            <div className="absolute bottom-4 left-4 text-xs sm:text-sm text-white bg-purple-900 bg-opacity-75 p-2 sm:p-3 rounded-lg shadow-lg">
                Use ⬆ and ⬇ arrows to move
            </div>
            )}
        </div>
    </div>

    </>
  )
}

export default Game