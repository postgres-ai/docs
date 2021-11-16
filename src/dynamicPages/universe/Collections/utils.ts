import moment from 'moment'
import { Author } from '../../../data/authors'
import { Collection } from '../../../data/collections'

export const getLatestFeed = (collections: Collection[], size: number = 8) => {
  return [...collections].map((c) => {
    const posts = c.posts.map((p) => {
      return {
        ...p,
        collection: c,
      }
    })

    return posts;
  })
    .flat()
    .sort((a, b) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);

      const dateAValid = a.date && a.date.length > 0 && dateA.isValid();
      const dateBValid = b.date && b.date.length > 0 && dateB.isValid();

      if (!dateAValid && !dateBValid) return 0;
      if (!dateAValid) return 1;
      if (!dateBValid) return -1;

      // @ts-ignore
      return dateB - dateA;
    })
    .slice(0, size);
}

export const getAuthorById = (
  authors: { [key: string]: Author },
  authorId?: string
) => {
  return authorId ? authors[authorId] : undefined
}
