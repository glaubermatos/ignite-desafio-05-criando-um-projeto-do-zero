import Link from 'next/link'
import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss'

export default function Header() {
  return(
    <header className={styles.header}>
      <div className={commonStyles.container}>
        <Link href='/'>
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </div>
    </header>
  )
}
