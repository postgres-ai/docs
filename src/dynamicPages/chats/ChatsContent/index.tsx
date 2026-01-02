import Layout from '@theme/Layout'
import Link from '@docusaurus/Link'
import classNames from 'clsx'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

import { getElapsedTimeString } from '../utils'

import styles from './styles.module.css'

// Slack emoji mappings - covers common emojis used in Slack conversations
// For unsupported codes, the original text (e.g., ':custom:') is preserved
const slackEmojiMap: Record<string, string> = {
  // Faces & emotions
  ':smile:': '😄', ':grinning:': '😀', ':joy:': '😂', ':rofl:': '🤣',
  ':smiley:': '😃', ':blush:': '😊', ':innocent:': '😇', ':wink:': '😉',
  ':heart_eyes:': '😍', ':kissing_heart:': '😘', ':relaxed:': '☺️',
  ':stuck_out_tongue:': '😛', ':stuck_out_tongue_winking_eye:': '😜',
  ':sunglasses:': '😎', ':smirk:': '😏', ':unamused:': '😒',
  ':disappointed:': '😞', ':worried:': '😟', ':confused:': '😕',
  ':frowning:': '☹️', ':cry:': '😢', ':sob:': '😭', ':angry:': '😠',
  ':rage:': '😡', ':thinking:': '🤔', ':thinking_face:': '🤔',
  ':neutral_face:': '😐', ':expressionless:': '😑', ':hushed:': '😯',
  ':astonished:': '😲', ':flushed:': '😳', ':scream:': '😱',
  ':cold_sweat:': '😰', ':sweat:': '😓', ':sleeping:': '😴',
  ':dizzy_face:': '😵', ':zipper_mouth:': '🤐', ':mask:': '😷',
  ':nerd:': '🤓', ':nerd_face:': '🤓', ':face_with_monocle:': '🧐',

  // Gestures & people
  ':thumbsup:': '👍', ':thumbsdown:': '👎', ':+1:': '👍', ':-1:': '👎',
  ':wave:': '👋', ':clap:': '👏', ':raised_hands:': '🙌', ':pray:': '🙏',
  ':point_up:': '☝️', ':point_down:': '👇', ':point_left:': '👈', ':point_right:': '👉',
  ':ok_hand:': '👌', ':v:': '✌️', ':muscle:': '💪', ':fist:': '✊',
  ':punch:': '👊', ':handshake:': '🤝', ':writing_hand:': '✍️',
  ':eyes:': '👀', ':eye:': '👁️', ':brain:': '🧠',

  // Hearts & symbols
  ':heart:': '❤️', ':orange_heart:': '🧡', ':yellow_heart:': '💛',
  ':green_heart:': '💚', ':blue_heart:': '💙', ':purple_heart:': '💜',
  ':black_heart:': '🖤', ':white_heart:': '🤍', ':broken_heart:': '💔',
  ':heartbeat:': '💓', ':heartpulse:': '💗', ':sparkling_heart:': '💖',
  ':star:': '⭐', ':star2:': '🌟', ':dizzy:': '💫', ':sparkles:': '✨',
  ':boom:': '💥', ':zap:': '⚡', ':fire:': '🔥', ':snowflake:': '❄️',

  // Status & indicators
  ':check:': '✅', ':white_check_mark:': '✅', ':heavy_check_mark:': '✔️',
  ':x:': '❌', ':negative_squared_cross_mark:': '❎', ':no_entry:': '⛔',
  ':warning:': '⚠️', ':question:': '❓', ':grey_question:': '❔',
  ':exclamation:': '❗', ':grey_exclamation:': '❕',
  ':heavy_plus_sign:': '➕', ':heavy_minus_sign:': '➖',

  // Objects & tools
  ':bulb:': '💡', ':memo:': '📝', ':pencil:': '✏️', ':pencil2:': '✏️',
  ':link:': '🔗', ':mag:': '🔍', ':mag_right:': '🔎',
  ':lock:': '🔒', ':unlock:': '🔓', ':key:': '🔑',
  ':hammer:': '🔨', ':wrench:': '🔧', ':gear:': '⚙️', ':tools:': '🛠️',
  ':package:': '📦', ':gift:': '🎁', ':trophy:': '🏆', ':medal:': '🏅',
  ':bell:': '🔔', ':no_bell:': '🔕', ':loudspeaker:': '📢',
  ':speech_balloon:': '💬', ':thought_balloon:': '💭',
  ':email:': '📧', ':envelope:': '✉️', ':inbox_tray:': '📥', ':outbox_tray:': '📤',
  ':clipboard:': '📋', ':file_folder:': '📁', ':open_file_folder:': '📂',
  ':calendar:': '📅', ':date:': '📅', ':clock:': '🕐',
  ':hourglass:': '⌛', ':stopwatch:': '⏱️', ':timer:': '⏲️',
  ':computer:': '💻', ':desktop:': '🖥️', ':keyboard:': '⌨️',
  ':phone:': '📱', ':telephone:': '☎️',

  // Tech & dev
  ':rocket:': '🚀', ':satellite:': '🛰️', ':robot:': '🤖', ':robot_face:': '🤖',
  ':bug:': '🐛', ':beetle:': '🪲', ':ant:': '🐜',
  ':globe_with_meridians:': '🌐', ':cloud:': '☁️', ':sunny:': '☀️',
  ':database:': '🗃️', ':floppy_disk:': '💾', ':cd:': '💿',

  // Celebration
  ':tada:': '🎉', ':confetti_ball:': '🎊', ':balloon:': '🎈',
  ':birthday:': '🎂', ':cake:': '🍰', ':champagne:': '🍾',
  ':party_popper:': '🎉', ':partying_face:': '🥳',

  // Arrows & navigation
  ':arrow_up:': '⬆️', ':arrow_down:': '⬇️', ':arrow_left:': '⬅️', ':arrow_right:': '➡️',
  ':arrow_upper_right:': '↗️', ':arrow_lower_right:': '↘️',
  ':arrow_upper_left:': '↖️', ':arrow_lower_left:': '↙️',
  ':arrows_counterclockwise:': '🔄', ':rewind:': '⏪', ':fast_forward:': '⏩',
  ':back:': '🔙', ':soon:': '🔜', ':top:': '🔝',

  // Numbers & letters
  ':one:': '1️⃣', ':two:': '2️⃣', ':three:': '3️⃣', ':four:': '4️⃣', ':five:': '5️⃣',
  ':six:': '6️⃣', ':seven:': '7️⃣', ':eight:': '8️⃣', ':nine:': '9️⃣', ':zero:': '0️⃣',
  ':hash:': '#️⃣', ':asterisk:': '*️⃣',
  ':a:': '🅰️', ':b:': '🅱️', ':ab:': '🆎', ':o:': '⭕', ':o2:': '🅾️',
  ':information_source:': 'ℹ️', ':new:': '🆕', ':free:': '🆓',
  ':up:': '🆙', ':cool:': '🆒', ':ok:': '🆗', ':sos:': '🆘',

  // Misc
  ':100:': '💯', ':1234:': '🔢', ':symbols:': '🔣',
  ':recycle:': '♻️', ':fleur_de_lis:': '⚜️', ':trident:': '🔱',
  ':beginner:': '🔰', ':heavy_dollar_sign:': '💲',
}

const getEmojiUnicode = (name: string): string => {
  return slackEmojiMap[name] || name
}

interface ChatProps {
  id: string
  created_at: string
  modified_at: any
  parent_id: string
  is_ai: boolean
  content: string
  user_id: any
  summary: any
  is_public: boolean
  via_app: string
  display_name: any
  first_name: string
  last_name: any
  children_ids: string[]
}

const convertSlackContentToMarkdown = (item: {
  content: string
  via_app?: string
}) => {
  let replacedContent = item.content
  if (item.via_app === 'slack') {
    replacedContent = item.content
      .replace(/:\w+:/gi, (name) => getEmojiUnicode(name))
      .replace(/\*(.*?)\*/gi, (name) => `**${name}**`)
      .replace(/\n•/gi, () => `\n-`)
      .replace(/\n/gi, () => `\n\n`)
      .replace(/<(.*?)\|(.*?)>/gi, (name, url, text) => `[${text}](${url})`)
  }

  return replacedContent
}

export const Chatscontent = () => {
  const { id } = useParams<{ id: string }>()
  const { siteConfig } = useDocusaurusContext()
  const apiUrlPrefix = siteConfig.customFields.apiUrlPrefix

  const [state, setState] = React.useState({
    data: [],
    loading: false,
    error: false,
  })

  const handleFetchChat = useCallback(() => {
    setState({ data: null, loading: true, error: false })
    fetch(`${apiUrlPrefix}/chats?id=eq.${id}`)
      .then((response) => response.json())
      .then((data) => {
        setState({ data, loading: false, error: false })
      })
      .catch(() => {
        setState({ data: null, loading: false, error: true })
      })
  }, [id])

  useEffect(() => {
    handleFetchChat()
  }, [id])

  return (
    <main className={styles.outerContainer}>
      <div className={styles.main}>
        <div
          style={{
            display: 'none',
          }}
        >
          <Layout title="Postgres Chat" />
        </div>
        <nav className={styles.navigation}>
          <Link className={styles.flex} to="/">
            <img
              src="/img/logo.svg"
              alt="Postgres Bot Logo"
              height="32px"
              width="32px"
            />
            <span>PostgresAI</span>
          </Link>
        </nav>
        <div
          className={
            state.loading || !state.data?.length ? styles.centerContent : ''
          }
        >
          {state.loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner} />
            </div>
          ) : state.data && state.data?.length > 0 ? (
            <div className={styles.messagesContainer}>
              {state.data.map((item: ChatProps) => (
                <div key={item.id} className={styles.messageContainer}>
                  <div className={styles.messageHeader}>
                    {(item.first_name || item.last_name) && (
                      <span className={styles.subtext}>
                        {item.first_name} {item.last_name} |
                      </span>
                    )}
                    {item.created_at && (
                      <span
                        className={classNames(styles.pointer, styles.subtext)}
                        title={item.created_at}
                      >
                        {getElapsedTimeString(item.created_at)} ago
                      </span>
                    )}
                    {item.parent_id && (
                      <span className={styles.subtext}>
                        | <Link to={`/chats/${item.parent_id}`}>prev</Link>
                      </span>
                    )}
                    {item.children_ids?.length > 0 && (
                      <span className={styles.subtext}>
                        |{' '}
                        <Link to={`/chats/${item.children_ids[0]}`}>next</Link>
                      </span>
                    )}
                  </div>
                  <ReactMarkdown
                    className={styles.messageContent}
                    linkTarget="_blank"
                  >
                    {convertSlackContentToMarkdown(item)}
                  </ReactMarkdown>
                </div>
              ))}
            </div>
          ) : (
            !state.loading && (
              <div className={styles.errorContainer}>
                <h2>Chat not found</h2>
                <p>
                  No chat found with the id <strong>{id}</strong>
                </p>
                <p>
                  <span onClick={handleFetchChat} className={styles.tryAgain}>
                    Try again
                  </span>{' '}
                  or go back to the <Link to="/">homepage</Link>.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  )
}
