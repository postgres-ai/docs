import React, { useEffect, useState } from 'react'
import { Message } from '@site/src/components/BotSample/Message'

const attentionPhrases = [
  "Ask me anything!",
  "Want to know more? Let's discuss!",
  "Got a question? I'm here to help!",
  "Curious about something? Just ask!",
  "Let's chat! What would you like to know?",
];

const getRandomPhrase = (currentPhrase: string) => {
  const filteredPhrases = attentionPhrases.filter(phrase => phrase !== currentPhrase);
  const randomIndex = Math.floor(Math.random() * filteredPhrases.length);
  return filteredPhrases[randomIndex] || attentionPhrases[0];
};

export const AnimatedMessage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentPhrase, setCurrentPhrase] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(40);

  useEffect(() => {
    setCurrentPhrase(getRandomPhrase(currentPhrase));
  }, []);


  useEffect(() => {
    if (!currentPhrase) return;

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing phase: add one character
        setDisplayedText(prev => currentPhrase.substring(0, prev.length + 1));

        // If the phrase is fully typed, start the pause before deleting
        if (displayedText.length + 1 === currentPhrase.length) {
          setIsDeleting(true);
          setTypingSpeed(1000); // Pause duration after completing the phrase
        } else {
          setTypingSpeed(40);
        }
      } else {
        // Deleting phase: remove one character
        setDisplayedText(prev => currentPhrase.substring(0, prev.length - 1));

        if (displayedText.length - 1 === 0) {
          setIsDeleting(false);
          const nextPhrase = getRandomPhrase(currentPhrase);
          setCurrentPhrase(nextPhrase);
          setTypingSpeed(500); // Short pause before typing the next phrase
        } else {
          setTypingSpeed(30);
        }
      }
    };

    const typingTimeout = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [displayedText, isDeleting, currentPhrase, typingSpeed]);

  return (
    <Message
      isAi
      content={displayedText || '⠀'}
    />
  );
};