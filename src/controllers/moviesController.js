const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const { format } = require('date-fns');

//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
            let promGenres = Genres.findAll();
            let promActors = Actors.findAll();
            
            Promise
            .all([promGenres, promActors])
            .then(([allGenres, allActors]) => {
                return res.render('moviesAdd', {allGenres,allActors})})
            .catch(error => res.send(error))
    },
    create: function (req,res) {
        Movies.create(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            }
        )
        .then(()=> {
            return res.redirect('/movies')})            
        .catch(error => res.send(error))
    },
    edit: function(req,res) {
        console.log("EDIT");
        let movieId = req.params.id;
        let promMovies = Movies.findByPk(movieId,{include: ['genre','actors']});
        let promGenres = Genres.findAll();
        let promActors = Actors.findAll();
        
        Promise.all([promMovies, promGenres, promActors])
            .then(([Movie, allGenres, allActors]) => {
                const fecha = new Date(Movie.release_date);
                const fechaFormateada = format(fecha, 'yyyy-MM-dd');
                Movie.release_date = `${fechaFormateada}`;
                return res.render('moviesEdit', {Movie,allGenres,allActors})})
            .catch(error => res.send(error))
    },
    update: function (req,res) {
        let movieId = req.params.id;
        Movies.update(
            {
                title: req.body.title,
                rating: req.body.rating,
                awards: req.body.awards,
                release_date: req.body.release_date,
                length: req.body.length,
                genre_id: req.body.genre_id
            },
            {
                where: {id: movieId}
            })
        .then(()=> {
            return res.redirect('/movies')})            
        .catch(error => res.send(error))
    },
    delete: function (req,res) {
        let movieId = req.params.id;
        Movies.findByPk(movieId)
            .then(Movie => {
                return res.render('moviesDelete', {Movie})})
            .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        let movieId = req.params.id;
        Movies.destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
            .then(()=>{
                return res.redirect('/movies')})
            .catch(error => res.send(error)) 
    }
}

module.exports = moviesController;