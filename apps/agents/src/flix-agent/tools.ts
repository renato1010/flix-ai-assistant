import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getTheatersFromMovieName } from "@/db/queries/cinemas-queries.js";
import { Command, END } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";
import {
  getMoviesByGenreAndCinema,
  getMovieInfo,
} from "@/db/queries/movie-queries.js";

const getMovieTheatersShowing = tool(
  async ({ movieTitle }: { movieTitle: string }) => {
    const movieTheaters = await getTheatersFromMovieName(movieTitle);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movieTheaters,
            tool_call_id: "get_movie_theaters_showing",
          }),
        ],
      },
      goto: END,
    });
  },
  {
    name: "getMovieTheatersShowing",
    description:
      "Get the list of movie theaters showing a specific movie. The input should be the movie title.",
    schema: z.object({
      movieTitle: z
        .string()
        .describe("The title of the movie the user is referring to"),
    }),
  }
);

const getMoviesByGenreAndOptionallyCinema = tool(
  async ({ genre, cinemaName }: { genre: string; cinemaName?: string }) => {
    const movies = await getMoviesByGenreAndCinema(genre, cinemaName);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movies,
            tool_call_id: "get_movies_by_genre_and_optionally_cinema",
          }),
        ],
      },
      goto: END,
    });
  },
  {
    name: "getMoviesByGenreAndOptionallyCinema",
    description:
      "Get the list of movies by genre and optionally by cinema. The input should be the genre and optionally the cinema name.",
    schema: z.object({
      genre: z.string().describe("The genre of the movie"),
      cinemaName: z.string().optional().describe("The name of the cinema"),
    }),
  }
);

// get full info about a movie
type GetMovieInfoArgs = {
  movieName: string;
  cinemaName?: string;
  referencedTime?: string;
};
const getMovieInfoByMovieName = tool(
  async ({ movieName, cinemaName, referencedTime }: GetMovieInfoArgs) => {
    const movieInfoAsText = await getMovieInfo(
      movieName,
      cinemaName,
      referencedTime
    );
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            content: movieInfoAsText,
            tool_call_id: "get_movie_info_by_passing_movie_name",
          }),
        ],
        goto: END,
      },
    });
  },
  {
    name: "getMovieInfoByPassingMovieName",
    description:
      "Get the full info about a movie by passing the movie name; cinema name and referenced time are optional.",
    schema: z.object({
      movieName: z.string().describe("The name of the movie"),
      cinemaName: z.string().optional().describe("The name of the cinema"),
      referencedTime: z
        .string()
        .optional()
        .describe("The time if is referenced previously"),
    }),
  }
);

export const tools = [
  getMovieTheatersShowing,
  getMoviesByGenreAndOptionallyCinema,
  getMovieInfoByMovieName,
];
