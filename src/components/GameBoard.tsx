import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';
import Card from './Card';

interface CardData {
  id: number;
  isLogoCard: boolean;
  isFlipped: boolean;
  ref: React.RefObject<HTMLDivElement>; // Add ref to CardData
}

const GameBoardContainer = styled.div`
  width: 100%;
  height: 100vh; // Full viewport height for vertical screen
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0; // Neutral background
  position: relative;
  overflow: hidden; // Hide cards outside the board during shuffle
`;

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  position: relative; // For absolute positioning of cards
  width: 350px; // Max width for 3 cards in a row (100*3 + 10*2)
  min-height: 170px; // Height for one row of cards
`;

const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [level, setLevel] = useState(1);
  const [isShuffling, setIsShuffling] = useState(false);
  const [canSelect, setCanSelect] = useState(false);
  const cardRefs = useRef<Array<React.RefObject<HTMLDivElement>>>([]);

  useEffect(() => {
    initializeLevel(level);
  }, [level]);

  const getCardPositions = (numCards: number) => {
    const positions: { x: number; y: number }[] = [];
    const cardWidth = 100;
    const cardHeight = 150;
    const gap = 10;
    const cardsPerRow = 3; // For vertical screen, let's try 3 cards per row

    for (let i = 0; i < numCards; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      const x = col * (cardWidth + gap) - (cardsPerRow * (cardWidth + gap) - gap) / 2 + cardWidth / 2;
      const y = row * (cardHeight + gap) - (Math.ceil(numCards / cardsPerRow) * (cardHeight + gap) - gap) / 2 + cardHeight / 2;
      positions.push({ x, y });
    }
    return positions;
  };

  const initializeLevel = (currentLevel: number) => {
    const numCards = Math.min(3 + (currentLevel - 1), 7); // Max 7 cards for level 5
    const logoCardId = Math.floor(Math.random() * numCards);

    cardRefs.current = Array(numCards).fill(0).map((_, i) => cardRefs.current[i] || React.createRef<HTMLDivElement>());

    const initialCards: CardData[] = Array.from({ length: numCards }, (_, i) => ({
      id: i,
      isLogoCard: i === logoCardId,
      isFlipped: false,
      ref: cardRefs.current[i],
    }));

    setCards(initialCards);

    const positions = getCardPositions(numCards);
    gsap.set(cardRefs.current.map(ref => ref.current), { x: 0, y: 0, rotationY: 0, zIndex: 1 }); // Reset positions

    // Position cards initially
    initialCards.forEach((card, index) => {
      if (card.ref.current) {
        gsap.to(card.ref.current, {
          x: positions[index].x,
          y: positions[index].y,
          duration: 0.5,
          ease: 'power2.out',
        });
      }
    });

    // Briefly show the logo card
    gsap.timeline()
      .to(initialCards[logoCardId].ref.current, { rotationY: 180, duration: 0.5, delay: 1 })
      .to(initialCards[logoCardId].ref.current, { rotationY: 0, duration: 0.5, delay: 1 })
      .call(() => startShuffle(initialCards));
  };

  const startShuffle = (currentCards: CardData[]) => {
    setIsShuffling(true);
    setCanSelect(false);

    const shuffleTimeline = gsap.timeline({
      onComplete: () => {
        setIsShuffling(false);
        setCanSelect(true);
      },
    });

    // Determine shuffle complexity based on level
    const shuffleDuration = 1.5 + (level * 0.2); // Increase duration slightly with level
    const numShuffles = 5 + (level * 2); // More shuffles for higher levels

    let currentCardPositions = currentCards.map((card, index) => ({
      id: card.id,
      ref: card.ref,
      originalIndex: index,
    }));

    for (let i = 0; i < numShuffles; i++) {
      // Randomly pick two cards to swap
      const idx1 = Math.floor(Math.random() * currentCardPositions.length);
      let idx2 = Math.floor(Math.random() * currentCardPositions.length);
      while (idx1 === idx2) {
        idx2 = Math.floor(Math.random() * currentCardPositions.length);
      }

      const card1 = currentCardPositions[idx1];
      const card2 = currentCardPositions[idx2];

      // Swap their positions in the array
      [currentCardPositions[idx1], currentCardPositions[idx2]] = [card2, card1];

      // Animate the swap
      shuffleTimeline.to([card1.ref.current, card2.ref.current], {
        x: (i % 2 === 0 ? "+=50" : "-=50"), // Add some horizontal movement
        y: (i % 2 === 0 ? "+=30" : "-=30"), // Add some vertical movement
        duration: shuffleDuration / numShuffles / 2, 
        ease: 'power1.inOut',
        stagger: 0.05,
        rotation: '+=10', // Add some rotation
        zIndex: 2, // Bring to front during swap
      }, `shuffle-${i}`)
      .to([card1.ref.current, card2.ref.current], {
        x: (i % 2 === 0 ? "-=50" : "+=50"),
        y: (i % 2 === 0 ? "-=30" : "+=30"),
        duration: shuffleDuration / numShuffles / 2,
        ease: 'power1.inOut',
        stagger: 0.05,
        rotation: '-=10',
        zIndex: 1, // Send back
      }, `shuffle-${i}+=${shuffleDuration / numShuffles / 2}`);
    }

    // After all swaps, update the actual card data based on the final positions
    shuffleTimeline.call(() => {
      const finalCardOrder = currentCardPositions.map(pos => currentCards.find(card => card.id === pos.id)!);
      setCards(finalCardOrder);
    });
  };

  const handleCardClick = (id: number) => {
    if (!canSelect || isShuffling) return;

    setCanSelect(false); // Prevent further clicks

    const clickedCard = cards.find(card => card.id === id);

    if (clickedCard?.isLogoCard) {
      alert('¡Ganaste!');
      // Reveal all cards to confirm win
      setCards(prevCards => prevCards.map(card => ({ ...card, isFlipped: true })));
      setTimeout(() => {
        setLevel(prevLevel => prevLevel + 1); // Go to next level
      }, 2000);
    } else {
      alert('¡Perdiste! Intenta de nuevo.');
      // Reveal clicked card and logo card
      setCards(prevCards =>
        prevCards.map(card => ({
          ...card,
          isFlipped: card.id === id || card.isLogoCard,
        }))
      );
      setTimeout(() => {
        setCards(prevCards => prevCards.map(card => ({ ...card, isFlipped: false }))); // Flip back
        startShuffle(cards); // Re-shuffle and try again
      }, 2000);
    }
  };

  return (
    <GameBoardContainer>
      <h1>Nivel: {level}</h1>
      <CardsContainer>
        {cards.map((card, index) => (
          <Card
            key={card.id}
            id={card.id}
            isLogoCard={card.isLogoCard}
            isFlipped={card.isFlipped}
            ref={card.ref} // Pass ref to Card
            onClick={handleCardClick}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%)`,
            }}
          />
        ))}
      </CardsContainer>
    </GameBoardContainer>
  );
};

export default GameBoard;
