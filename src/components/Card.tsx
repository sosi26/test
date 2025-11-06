import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { gsap } from 'gsap';

interface CardProps {
  id: number;
  isLogoCard: boolean;
  isFlipped: boolean;
  position: { x: number; y: number }; // Will be used later for animations
  onClick: (id: number) => void;
}

const CardContainer = styled.div<{ isFlipped: boolean }>`
  width: 100px;
  height: 150px;
  border: 2px solid #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  background-color: transparent; // Managed by CardFace
  cursor: pointer;
  position: absolute; // Will be positioned by GameBoard
  transform-style: preserve-3d; // Enable 3D transformations
`;

const CardFace = styled.div<{ isFront: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  background-color: ${props => (props.isFront ? '#fff' : '#f8c8dc')};
  transform: ${props => (props.isFront ? 'rotateY(0deg)' : 'rotateY(180deg)')};
`;

const Card: React.FC<CardProps> = ({ id, isLogoCard, isFlipped, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        rotationY: isFlipped ? 180 : 0,
        duration: 0.5,
        ease: 'power2.inOut',
      });
    }
  }, [isFlipped]);

  const handleClick = () => {
    if (!isFlipped) { // Only allow clicking if not already flipped
      onClick(id);
    }
  };

  return (
    <div style={{ perspective: '1000px', position: 'absolute' }}> {/* Wrapper for perspective */}
      <CardContainer ref={cardRef} isFlipped={isFlipped} onClick={handleClick}>
        <CardFace isFront={true}>
          {isLogoCard ? 'LOGO' : 'X'}
        </CardFace>
        <CardFace isFront={false}>
          Card
        </CardFace>
      </CardContainer>
    </div>
  );
};

export default Card;
