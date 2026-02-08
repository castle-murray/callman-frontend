import React from 'react'

export function ShadowedText({ 
  text, 
  shadowColor = 'rgba(15, 23, 42, 0.6)',
  shadowOffset = 0.5 
}) {
  return (
    <span>
      {text.split('').map((letter, index) => (
        <span
          key={index}
          className="inline-block shadowed-text-letter"
          style={{
            textShadow: `4px 4px 4px ${shadowColor}`,
            marginRight: letter === ' ' ? '0.25em' : '0'
          }}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}
