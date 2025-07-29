import React, { useState, useEffect, useRef } from 'react'
import Link from '@docusaurus/Link'
import { launchWeekData } from '@site/src/data/launchWeek'
import styles from './styles.module.css'
import commonStyles from '@site/src/css/launchWeek.module.css'

function LaunchWeekPreview() {
  const [isVisible, setIsVisible] = useState(true)
  
  // All days are always visible (Monday-Friday)
  const allDays = [0, 1, 2, 3, 4]

  const getDayCard = (dayIndex: number) => {
    const day = launchWeekData[dayIndex]
    const isLocked = day.isLocked

    return (
      <div 
        key={dayIndex}
        className={`${commonStyles.dayCard} ${styles.dayCard} ${isLocked ? commonStyles.lockedDay : commonStyles.availableDay}`}
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
              <div className={commonStyles.blogLink}>
                <Link to={day.blogPost.url} className={commonStyles.blogButton}>
                  📖 Read more
                </Link>
              </div>
            )}
            
            {day.minorReleases.length > 0 && (
              <div className={commonStyles.minorReleases}>
                <span className={commonStyles.minorLabel}>Minor releases:</span>
                <ul className={commonStyles.minorList}>
                  {day.minorReleases.map((release, idx) => (
                    <li key={idx} className={commonStyles.minorItem}>
                      {typeof release === 'string' ? (
                        <>• {release}</>
                      ) : (
                        <>
                          • {release.name}
                          {release.blogPost && release.blogPost.url && (
                            <Link to={release.blogPost.url} className={commonStyles.minorBlogLink}>
                              {' '}→ read more
                            </Link>
                          )}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
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

          <div className={styles.schedule}>
            {allDays.map(dayIndex => getDayCard(dayIndex))}
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