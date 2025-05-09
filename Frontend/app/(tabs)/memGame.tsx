import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Animated, 
  Modal,
  Pressable
} from 'react-native';

type Color = 'red' | 'blue' | 'green' | 'yellow';

export default function MemoryGame() {
  // Game states
  const [gameSequence, setGameSequence] = useState<Color[]>([]);
  const [userSequence, setUserSequence] = useState<Color[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [highScore, setHighScore] = useState(0);

  // Animation values for each button
  const redAnim = useRef(new Animated.Value(1)).current;
  const blueAnim = useRef(new Animated.Value(1)).current;
  const greenAnim = useRef(new Animated.Value(1)).current;
  const yellowAnim = useRef(new Animated.Value(1)).current;

  // Start a new game
  const startNewGame = () => {
    setGameSequence([]);
    setUserSequence([]);
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    addToSequence();
  };

  // Add a new color to the sequence
  const addToSequence = () => {
    const colors: Color[] = ['red', 'blue', 'green', 'yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    setGameSequence(prevSequence => {
      const newSequence = [...prevSequence, randomColor];
      setTimeout(() => playSequence(newSequence), 1000);
      return newSequence;
    });
  };

  // Play the current sequence
  const playSequence = async (sequence: Color[]) => {
    setIsShowingSequence(true);
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      glowButton(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsShowingSequence(false);
  };

  // Handle button glow animation
  const glowButton = (color: Color) => {
    const animValue = {
      red: redAnim,
      blue: blueAnim,
      green: greenAnim,
      yellow: yellowAnim
    }[color];

    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle user button press
  const handleButtonPress = (color: Color) => {
    // Don't allow input while showing sequence
    if (isShowingSequence || !isPlaying) return;
    
    glowButton(color);
    
    setUserSequence(prevSequence => {
      const newSequence = [...prevSequence, color];
      
      // Check if the new input matches the game sequence so far
      const currentIndex = newSequence.length - 1;
      
      if (newSequence[currentIndex] !== gameSequence[currentIndex]) {
        // Wrong input
        endGame();
        return newSequence;
      }
      
      // Check if the user completed the current sequence
      if (newSequence.length === gameSequence.length) {
        // Correct complete sequence
        const newScore = gameSequence.length;
        setScore(newScore);
        if (newScore > highScore) {
          setHighScore(newScore);
        }
        
        // Reset user sequence and add to game sequence
        setTimeout(() => {
          setUserSequence([]);
          addToSequence();
        }, 1000);
      }
      
      return newSequence;
    });
  };

  // End the game
  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Game</Text>
      <Text style={styles.scoreText}>Score: {score}</Text>
      <Text style={styles.scoreText}>High Score: {highScore}</Text>
      
      {!isPlaying && !isGameOver && (
        <Pressable 
          style={styles.startButton}
          onPress={startNewGame}
        >
          <Text style={styles.startButtonText}>Start Game</Text>
        </Pressable>
      )}
      
      <View style={styles.gameContainer}>
        <View style={styles.row}>
          <Animated.View style={{ opacity: redAnim }}>
            <TouchableOpacity 
              style={[styles.gameButton, styles.redButton]}
              onPress={() => handleButtonPress('red')}
              disabled={isShowingSequence || !isPlaying || isGameOver}
            />
          </Animated.View>
          <Animated.View style={{ opacity: blueAnim }}>
            <TouchableOpacity 
              style={[styles.gameButton, styles.blueButton]}
              onPress={() => handleButtonPress('blue')}
              disabled={isShowingSequence || !isPlaying || isGameOver}
            />
          </Animated.View>
        </View>
        <View style={styles.row}>
          <Animated.View style={{ opacity: greenAnim }}>
            <TouchableOpacity 
              style={[styles.gameButton, styles.greenButton]}
              onPress={() => handleButtonPress('green')}
              disabled={isShowingSequence || !isPlaying || isGameOver}
            />
          </Animated.View>
          <Animated.View style={{ opacity: yellowAnim }}>
            <TouchableOpacity 
              style={[styles.gameButton, styles.yellowButton]}
              onPress={() => handleButtonPress('yellow')}
              disabled={isShowingSequence || !isPlaying || isGameOver}
            />
          </Animated.View>
        </View>
      </View>
      
      {isShowingSequence && (
        <Text style={styles.statusText}>Watch the sequence...</Text>
      )}
      
      {isPlaying && !isShowingSequence && (
        <Text style={styles.statusText}>Your turn! Repeat the sequence.</Text>
      )}
      
      {/* Game Over Modal */}
      <Modal
        transparent={true}
        visible={isGameOver}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over!</Text>
            <Text style={styles.modalText}>Your score: {score}</Text>
            <Text style={styles.modalText}>High score: {highScore}</Text>
            <Pressable 
              style={styles.modalButton}
              onPress={startNewGame}
            >
              <Text style={styles.modalButtonText}>Play Again</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
  },
  gameContainer: {
    width: 300,
    height: 300,
    marginVertical: 20,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gameButton: {
    width: 140,
    height: 140,
    borderRadius: 10,
  },
  redButton: {
    backgroundColor: '#ff4444',
  },
  blueButton: {
    backgroundColor: '#4444ff',
  },
  greenButton: {
    backgroundColor: '#44ff44',
  },
  yellowButton: {
    backgroundColor: '#ffff44',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
    color: '#666',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});