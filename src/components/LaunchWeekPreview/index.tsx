import React, { useState, useEffect, useRef } from 'react'
import Link from '@docusaurus/Link'
import { launchWeekData } from '@site/src/data/launchWeek'
import styles from './styles.module.css'
import commonStyles from '@site/src/css/launchWeek.module.css'

function LaunchWeekPreview() {
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [visibleDays, setVisibleDays] = useState<number[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const scheduleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Determine current day index (0-4 for Monday-Friday)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    //const currentIndex = Math.min(mondayIndex, 4)
    const currentIndex = 0
    setCurrentDayIndex(currentIndex)
    
    // Calculate visible days: yesterday, today, tomorrow
    const yesterday = Math.max(0, currentIndex - 1)
    const tomorrow = Math.min(4, currentIndex + 1)
    
    // Ensure we have unique days and handle edge cases
    let daysToShow = []
    if (currentIndex === 0) {
      // Monday: show Monday, Tuesday
      daysToShow = [0, 1, 2]
    } else if (currentIndex === 4) {
      // Friday: show Thursday, Friday
      daysToShow = [2, 3, 4]
    } else {
      // Other days: show yesterday, today, tomorrow
      daysToShow = [yesterday, currentIndex, tomorrow]
    }
    
    setVisibleDays(daysToShow)
  }, [])

  // Scroll to current day when component mounts or current day changes
  useEffect(() => {
    if (scheduleRef.current && visibleDays.length > 0) {
      const currentDayPosition = visibleDays.indexOf(currentDayIndex)
      if (currentDayPosition !== -1) {
        const currentDayElement = scheduleRef.current.children[currentDayPosition] as HTMLElement
        if (currentDayElement) {
          // Use scrollIntoView with scroll-padding
          currentDayElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          })
        }
      }
    }
  }, [currentDayIndex, visibleDays])

  const getDayCard = (dayIndex: number) => {
    const day = launchWeekData[dayIndex]
    const isCurrentDay = dayIndex === currentDayIndex
    const isLocked = day.isLocked

    return (
      <div 
        key={dayIndex}
        className={`${commonStyles.dayCard} ${styles.dayCard} ${isCurrentDay ? commonStyles.currentDay : isLocked ? commonStyles.lockedDay : commonStyles.availableDay}`}
      >
        <div className={commonStyles.dayHeader}>
          <span className={commonStyles.dayName}>{day.day}</span>
          <span className={commonStyles.dayDate}>{day.date}</span>
          {isLocked && <span className={commonStyles.lockedIcon}>🔒</span>}
        </div>
        
        {!isLocked ? (
          <>
            <div className={commonStyles.mainRelease}>
              <span className={commonStyles.releaseName}>{day.mainRelease}</span>
            </div>
            <div className={commonStyles.description}>
              {day.description}
            </div>
            {day.blogPost.title && (
              <Link to={day.blogPost.url} className={commonStyles.blogLink}>
                <span className={commonStyles.blogButton}>📖 Read more</span>
              </Link>
            )}
          </>
        ) : (
          <div className={commonStyles.lockedContent}>
            <div className={commonStyles.lockedText}>Coming Soon</div>
          </div>
        )}
      </div>
    )
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.terminal}>
        <div className={styles.terminalHeader}>
          <div className={styles.terminalButtons}>
            <span 
              className={styles.close} 
              onClick={() => setIsVisible(false)}
              title="Close preview"
            ></span>
            <span 
              className={styles.minimize} 
              title="Minimize"
            ></span>
            <Link to="/launch-week" className={styles.maximize} style={{ textDecoration: 'none' }}>
              <span 
                className={styles.maximize} 
                title="View full schedule"
              ></span>
            </Link>
          </div>
          <div className={styles.terminalTitle}>postgres-ai@launch-week:~$</div>
        </div>
        
        <div className={styles.terminalContent}>
          <div className={styles.welcome}>
            <div className={styles.prompt}>$</div>
            <div className={styles.command}>echo "🚀 Launch week July 2025"</div>
          </div>
          
          <div className={styles.output}>
            🚀 Launch week July 2025
          </div>

          <div className={styles.welcome}>
            <div className={styles.prompt}>$</div>
            <div className={styles.command}>cat launch-week.txt</div>
          </div>

          <div className={styles.schedule} ref={scheduleRef}>
            {visibleDays.map(dayIndex => getDayCard(dayIndex))}
          </div>

          <div className={styles.welcome}>
            <div className={styles.prompt}>$</div>
            <div className={styles.command}>echo "View full schedule for complete details"</div>
          </div>
          
          <div className={styles.output}>
            View full schedule for complete details
          </div>

          <div className={styles.footer}>
            <Link to="/launch-week" className={styles.viewAllButton}>
              View Full Schedule →
            </Link>
          </div>

          {/* <div className={styles.welcome}>
            <div className={styles.prompt}>$</div>
            <div className={styles.cursor}></div>
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default LaunchWeekPreview 