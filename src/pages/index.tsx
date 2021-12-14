import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {

  const { next_page, results } = postsPagination

  const [nextPage, setNextPage] = useState(next_page)
  const [posts, setPosts] = useState<Post[]>(results)

  async function loadMorePosts() {
    const response = await fetch(nextPage)
    const postsLoadedResponse = await response.json()

    const postsLoadedFormated = postsLoadedResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date), 
        'd MMM y',
        {
          locale: ptBR
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }))

    setNextPage(postsLoadedResponse.next_page)
    setPosts([...posts, ...postsLoadedFormated])
  }

  return(
    <>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>
      <main className={commonStyles.container}>
        <img className={styles.logo} src="/images/logo.svg" alt="logo" />
        <div className={styles.posts}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a className={styles.post} >
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time>
                  <FiCalendar size={20} />
                  {post.first_publication_date}
                </time>
                <span>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button 
            className={styles.btnLoadMorePosts}
            onClick={loadMorePosts}
          >
            Carregar mais posts
          </button>
        )}

      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    { pageSize : 1 }
  )

  const nextPage = postsResponse.next_page

  const postsFormated: Post[] = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: format(
      new Date(post.first_publication_date), 
      'd MMM y',
      {
        locale: ptBR
      }
    ),
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    }
  }))

  return {
    props: {
      postsPagination: {
        next_page: nextPage,
        results: postsFormated
      }
    }
  }
};
