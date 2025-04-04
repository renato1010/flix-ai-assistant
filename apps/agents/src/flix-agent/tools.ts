import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { getTheatersFromMovieName } from '@/db/queries/cinemas-queries.js';
import { Command, END } from '@langchain/langgraph';
import { ToolMessage } from '@langchain/core/messages';

const getMovieTheatersShowing = tool(
  async ({ movieTitle }: { movieTitle: string }) => {
    const movieTheaters = await getTheatersFromMovieName(movieTitle);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movieTheaters,
            tool_call_id: 'get_movie_theaters_showing'
          })
        ]
      },
      goto: END
    });
  },
  {
    name: 'getMovieTheatersShowing',
    description:
      'Get the list of movie theaters showing a specific movie. The input should be the movie title.',
    schema: z.object({
      movieTitle: z.string().describe('The title of the movie the user is referring to')
    })
  }
);

export const tools = [getMovieTheatersShowing];
