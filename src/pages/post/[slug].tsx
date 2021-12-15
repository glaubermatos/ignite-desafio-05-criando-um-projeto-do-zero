import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head'
import { RichText } from 'prismic-dom'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  estimatedReadingTime: number;
}

export default function Post({post, estimatedReadingTime}: PostProps) {

  return(
    <>
      <Head>
        <title>slug | Space Traveling</title>
      </Head>

      <Header />

      <img className={styles.banner} src={post.data.banner.url} alt={post.data.title}/>
      <div className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <time>
            <FiCalendar size={20} />
            {post.first_publication_date}
          </time>
          <span>
            <FiUser size={20} />
            {post.data.author}
          </span>
          <span>
            <FiClock size={20} />
            {`${estimatedReadingTime} min`}
          </span>
          <div className={styles.postContent}>
            {post.data.content.map(({heading, body}) => (
              <div>
                { heading && <h2>{ heading }</h2> }

                <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }} />
              </div>
            ))}
          </div>
        </article>
      </div>
    </>
  )
}

function calculationOfEstimatedReadingTimeOfThePost(amountWordsOfPost: number) {
  const averageWordsPerMinute = 200
  return Math.ceil(amountWordsOfPost/averageWordsPerMinute)
}

function calculationAmountWordsOfHeading(postContent: { heading: string, body: { text: string }[] }[]) {
  return postContent.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')]
    }

    return [...acc]
  }, []).length
}

function calculationAmountWordsOfBody(postContent: { heading: string, body: { text: string }[] }[]) {
  return RichText.asText(
    postContent.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context
  const { slug } = params

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const amountWordsOfHeading = calculationAmountWordsOfHeading(response.data.content)
  const amountWordsOfBody = calculationAmountWordsOfBody(response.data.content)
  const amountWordsOfPost = amountWordsOfBody + amountWordsOfHeading
  const estimatedReadingTime = calculationOfEstimatedReadingTimeOfThePost(amountWordsOfPost)
  
  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date), 
      'd MMM y',
      {
        locale: ptBR
      }
    ) ,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post,
      estimatedReadingTime
    },
    revalidate: 60 * 30, //30 minutos
  }
};
