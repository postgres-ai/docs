import React, { useState } from 'react'
import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import { launchWeekData } from '@site/src/data/launchWeek'
import styles from './launch-week.module.css'
import commonStyles from '@site/src/css/launchWeek.module.css'

function LaunchWeekPage() {
  // Get current day of week (0 = Sunday, 1 = Monday, etc.)
  const getCurrentDayIndex = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert to our array index (Monday = 0, Tuesday = 1, etc.)
    const mondayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday becomes 6, Monday becomes 0
    //return Math.min(mondayIndex, 4); // Cap at Friday (index 4)
    return 0
  };

  const [activeDay, setActiveDay] = useState(getCurrentDayIndex());

  return (
    <Layout title="Launch Week - Postgres AI">
      <main className={styles.container}>
        <div className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalButtons}>
              <span className={styles.close}></span>
              <span className={styles.minimize}></span>
              <span className={styles.maximize}></span>
            </div>
            <div className={styles.terminalTitle}>postgres-ai@launch-week:~$</div>
          </div>
          
          <div className={styles.terminalContent}>
            <div className={styles.welcome}>
              <div className={styles.prompt}>$</div>
              <div className={styles.command}>echo "🚀 Welcome to Postgres AI launch week July 2025! 🚀"</div>
            </div>
            
            <div className={styles.output}>
              🚀 Welcome to Postgres AI launch week July 2025! 🚀
            </div>

            <div className={styles.welcome}>
              <div className={styles.prompt}>$</div>
              <div className={styles.command}>cat launch-week-schedule.txt</div>
            </div>

            <div className={styles.schedule}>
              {launchWeekData.map((day, index) => (
                <div 
                  key={index} 
                  className={`${commonStyles.dayCard} ${index === activeDay ? commonStyles.currentDay : !day.isLocked ? commonStyles.availableDay : commonStyles.hiddenDay}`}
                  onClick={() => !day.isLocked && setActiveDay(index)}
                >
                  <div className={commonStyles.dayHeader}>
                    <span className={commonStyles.dayName}>{day.day}</span>
                    <span className={commonStyles.dayDate}>{day.date}</span>
                    {day.isLocked && (
                      <span className={commonStyles.lockedIndicator}>🔒</span>
                    )}
                  </div>
                  
                  {!day.isLocked ? (
                    <>
                      <div className={commonStyles.mainRelease}>
                        <span className={commonStyles.releaseLabel}>MAIN RELEASE:</span>
                        <span className={commonStyles.releaseName}>{day.mainRelease}</span>
                      </div>
                      
                      <div className={commonStyles.description}>
                        {day.description}
                      </div>
                      
                      {day.minorReleases.length > 0 && (
                        <div className={commonStyles.minorReleases}>
                          <span className={commonStyles.minorLabel}>Minor releases:</span>
                          <ul className={commonStyles.minorList}>
                            {day.minorReleases.map((release, idx) => (
                              <li key={idx} className={commonStyles.minorItem}>
                                • {release}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {day.blogPost.title && (
                        <div className={commonStyles.blogLink}>
                          <Link to={day.blogPost.url} className={commonStyles.blogButton}>
                            📖 Read: {day.blogPost.title}
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={commonStyles.lockedContent}>
                      <div className={commonStyles.lockedMessage}>
                        🔒 Coming {day.day}
                      </div>
                      <div className={commonStyles.lockedPreview}>
                        {day.mainRelease}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.welcome}>
              <div className={styles.prompt}>$</div>
              <div className={styles.command}>echo "Stay tuned for daily updates and live demos!"</div>
            </div>
            
            <div className={styles.output}>
              Stay tuned for daily updates and live demos!
            </div>

            {/* <div className={styles.welcome}>
              <div className={styles.prompt}>$</div>
              <div className={styles.cursor}></div>
            </div> */}
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default LaunchWeekPage 