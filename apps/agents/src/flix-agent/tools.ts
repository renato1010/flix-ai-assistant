import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getTheatersShowingMovie, getTheatersLocatedInZone } from "@/db/queries/cinemas-queries.js";
import { Command, END } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";
import {
  getMoviesByGenreAndCinema,
  getMovieInfo,
  getMoviesByCinemaName,
} from "@/db/queries/movie-queries.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";

const getMovieListInTheater = tool(
  async ({ cinemaName }: { cinemaName: string }) => {
    const movies = await getMoviesByCinemaName(cinemaName);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movies,
            tool_call_id: "get_movie_list_in_theater",
          }),
        ],
      },
      goto: END,
    });
  },
  {
    name: "getMovieListInTheater",
    description:
      "Get the list of movies in a specific theater. The input should be the theater name as referenced.",
    schema: z.object({
      cinemaName: z.string().describe("The name of the theater as referenced"),
    }),
  }
);

const getTheaterListShowingMovie = tool(
  async ({ movieTitle }: { movieTitle: string }) => {
    const movieTheaters = await getTheatersShowingMovie(movieTitle);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movieTheaters,
            tool_call_id: "get_theater_list_showing_movie",
          }),
        ],
      },
      goto: END,
    });
  },
  {
    name: "getTheaterListShowingMovie",
    description:
      "Get the list of theaters showing a specific movie. The input should be the movie title as in reference block.",
    schema: z.object({
      movieTitle: z.string().describe("The title of the movie the user is referring to as referenced"),
    }),
  }
);

const getMoviesByGenreAndOptionallyCinemaName = tool(
  async ({ genre, cinemaName }: { genre: string; cinemaName?: string }) => {
    const movies = await getMoviesByGenreAndCinema(genre, cinemaName);
    return new Command({
      // update state keys
      update: {
        messages: [
          new ToolMessage({
            content: movies,
            tool_call_id: "get_movies_by_genre_and_optionally_cinema_name",
          }),
        ],
      },
      goto: END,
    });
  },
  {
    name: "getMoviesByGenreAndOptionallyCinemaName",
    description:
      "Get the list of movies by genre and optionally by cinema name. The input should be the genre and optionally the cinema name.",
    schema: z.object({
      genre: z.string().describe("The genre of the movie as referenced"),
      cinemaName: z.string().optional().describe("The name of the cinema if referenced"),
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
    const movieInfoAsText = await getMovieInfo(movieName, cinemaName, referencedTime);
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            content: movieInfoAsText,
            tool_call_id: "get_movie_info_by_movie_name",
          }),
        ],
        goto: END,
      },
    });
  },
  {
    name: "getMovieInfoByMovieName",
    description:
      "Retrieve complete movie information by providing the movie name. Optionally filter results will be returned by specifying a cinema/theater name and/or a time reference.",
    schema: z.object({
      movieName: z.string().describe("The name of the movie"),
      cinemaName: z.string().optional().describe("The name of the cinema only if referenced"),
      referencedTime: z.string().optional().describe("The time if is referenced"),
    }),
  }
);

const getTheatersNearReferencedZone = tool(
  async ({ zoneRef }: { zoneRef: string[] }) => {
    const cinemas = await getTheatersLocatedInZone(zoneRef);
    return new Command({
      update: {
        messages: [
          new ToolMessage({
            content: cinemas,
            tool_call_id: "get_theaters_near_referenced_zone",
          }),
        ],
        goto: END,
      },
    });
  },
  {
    name: "getTheatersNearReferencedZone",
    description:
      "Get the list of cinemas near a referenced zone. The input should be the list of zone(s) referenced.",
    schema: z.object({
      zoneRef: z.array(z.string()).describe("The zone list previously referenced"),
    }),
  }
);

export const tools = [
  getMovieListInTheater,
  getTheaterListShowingMovie,
  getMoviesByGenreAndOptionallyCinemaName,
  getMovieInfoByMovieName,
  getTheatersNearReferencedZone,
];

export const toolNode = new ToolNode(tools);
