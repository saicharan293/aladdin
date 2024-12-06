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

    const gameLoogRef = useRef(null)
    const audioRef = useRef( null)

    useEffect(()=>{
        audioRef.current = new Audio('/bg.mp3')
        audioRef.current.loop = true;
        const startMusic = () => {
            audioRef.current.play()
            document.removeEventListener('keydown', startMusic)
        }
        document.addEventListener('keydown', startMusic)
        return ()=>{
            if(audioRef.current){
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    },[])

    useEffect(()=>{
        if(gameOver) return
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

                for (const weapon of moved){
                    const HORIZONTAL_PADDING = 30
                    const TOP_PADDING = 15
                    const BOTTOM_PADDING = 30

                    const carpetBox = {
                        left: carpetPosition.x + HORIZONTAL_PADDING, 
                        right: carpetPosition.x + CARPET_SIZE - HORIZONTAL_PADDING,
                        top: carpetPosition.y + TOP_PADDING,
                        bottom: carpetPosition.y + CARPET_SIZE - BOTTOM_PADDING
                    }

                    const weaponBox ={
                        left: weapon.x + 10, 
                        right: weapon.x + WEAPON_SIZE - 10,
                        top: weapon.y + 10,
                        bottom: weapon.y + WEAPON_SIZE - 10
                    }
                    if(
                        carpetBox.left < weaponBox.right && 
                        carpetBox.right > weaponBox.left &&
                        carpetBox.top < weaponBox.bottom && 
                        carpetBox.bottom > weaponBox.top
                    ){
                        const overlapX = Math.max( carpetBox.right - weaponBox.left, weaponBox.right - carpetBox.left)
                        const overlapY = Math.max( carpetBox.bottom - weaponBox.top, weaponBox.bottom - carpetBox.top)
                        if(overlapX > 10 && overlapY > 10){
                            setGameOver(true)
                            if(audioRef.current){
                                audioRef.current.pause()
                            }
                            break
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
    },[gameOver, speed])

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
        if(audioRef.current){
            audioRef.current.currentTime = 0
            audioRef.current.play()
        }
    }

    useEffect(()=>{

        if(gameOver) return
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
    },[isMovingDown, isMovingUp, gameOver])

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-4">
        <div 
            className="relative w-full max-w-5xl h-[60vw] max-h-[600px] overflow-hidden rounded-lg shadow-2xl border-4 border-yellow-400"
            style={{
                backgroundImage: "url('https://img.freepik.com/premium-vector/muslim-city-buildings_18591-72466.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: `${-score}px 0`
            }}
        >
            {/* Score Display */}
            <div className="absolute top-4 right-4 text-lg sm:text-2xl font-bold text-white bg-purple-900 bg-opacity-75 p-2 sm:p-3 rounded-lg">
                Score: {score}
            </div>

            {/* Aladdin on the Carpet */}
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

            {/* Weapons */}
            {weapons.map((weapon, index) => (
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
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-400 text-purple-900 text-lg sm:text-xl font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                            onClick={resetGame}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 text-xs sm:text-sm text-white bg-purple-900 bg-opacity-75 p-2 sm:p-3 rounded-lg shadow-lg">
                Use ⬆ and ⬇ arrows to move
            </div>
        </div>
    </div>

    </>
  )
}

export default Game