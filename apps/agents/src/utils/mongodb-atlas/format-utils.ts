import { Movie, Cinema } from '@prisma/client';

export function formatMovieRawText({
  movieName,
  synopsis,
  genre,
  movieLength,
  movieCast,
  movieDirectors
}: Pick<
  Movie,
  'movieName' | 'synopsis' | 'genre' | 'movieLength' | 'movieCast' | 'movieDirectors'
>) {
  return `
  <pelicula> \n
  Titulo: ${movieName} \n
  Descripcion: ${synopsis} \n
  Genero: ${genre} \n
  Duracion: ${movieLength} \n
  Elenco: ${movieCast} \n
  Director(es): ${movieDirectors} \n
  </pelicula>
  `;
}

export function formatCinemaRawText({
  name,
  cinemaAddress
}: Pick<Cinema, 'name' | 'cinemaAddress'>) {
  return `
  <cinema> \n
  Nombre: ${name} \n
  Direccion: ${cinemaAddress} \n
  </cinema>
  `;
}
