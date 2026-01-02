import { Author } from '../../../data/authors'
import { Collection } from '../../../data/collections'

const isValidDate = (date: Date): boolean => !isNaN(date.getTime())

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
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      const dateAValid = a.date && a.date.length > 0 && isValidDate(dateA);
      const dateBValid = b.date && b.date.length > 0 && isValidDate(dateB);

      if (!dateAValid && !dateBValid) return 0;
      if (!dateAValid) return 1;
      if (!dateBValid) return -1;

      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, size);
}

export const getAuthorById = (
  authors: { [key: string]: Author },
  authorId?: string
) => {
  return authorId ? authors[authorId] : undefined
}
