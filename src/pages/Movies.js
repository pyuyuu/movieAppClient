import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Modal, Form, Container, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import UserContext from '../UserContext';

export default function Movies() {
    const { user } = useContext(UserContext);
    const [movies, setMovies] = useState([]);
    const [newMovie, setNewMovie] = useState({
        title: '',
        director: '',
        year: '',
        description: '',
        genre: '',
    });
    const [newComment, setNewComment] = useState('');
    const [movieId, setMovieId] = useState(null);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [movieToUpdate, setMovieToUpdate] = useState(null);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    const closeCommentModal = () => setShowCommentModal(false);
    const handleUpdateModalClose = () => setShowUpdateModal(false);
    const handleUpdateModalShow = (movie) => {
        setMovieToUpdate(movie);
        setMovieId(movie._id);
        setShowUpdateModal(true);
    };

    useEffect(() => {
        getMovies();
    }, [user]);

    const getMovies = async () => {
        if (!user?.token) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`https://movieapp-api-lms1.onrender.com/movies/getMovies`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            const data = await response.json();
            if (response.ok) {
                setMovies(data.movies);
                setFilteredMovies(data.movies);
            } else {
                toast.error('Unable to fetch movies');
            }
        } catch (error) {
            console.error('Error fetching movies:', error);
            toast.error('Unable to fetch movies');
        }
        setLoading(false);
    };

    const addMovie = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://movieapp-api-lms1.onrender.com/movies/addMovie`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify(newMovie),
            });
            if (response.ok) {
                toast.success('Movie added successfully');
                setNewMovie({ title: '', director: '', year: '', description: '', genre: '' });
                handleClose();
                getMovies();
            } else {
                const data = await response.json();
                toast.error(data.message || 'Unable to add movie');
            }
        } catch (error) {
            console.error('Error adding movie:', error);
            toast.error('Unable to add movie');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!movieId) {
            toast.error('No movie selected');
            return;
        }
    
        try {
            const response = await fetch(
                `https://movieapp-api-lms1.onrender.com/movies/addComment/${movieId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ comment: newComment }),
                }
            );
            if (response.ok) {
                toast.success('Comment added successfully');
                setNewComment('');
                closeCommentModal();
                getMovies();
            } else {
                toast.error('Unable to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Unable to add comment');
        }
    };

    const handleUpdateMovie = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://movieapp-api-lms1.onrender.com/movies/updateMovie/${movieId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ title: movieToUpdate.title, director: movieToUpdate.director, year: movieToUpdate.year, description: movieToUpdate.description, genre: movieToUpdate.genre }),
            });
            if (response.ok) {
                toast.success('Movie updated successfully');
                handleUpdateModalClose();
                getMovies();
            } else {
                toast.error('Unable to update movie');
            }
        } catch (error) {
            console.error('Error updating movie:', error);
            toast.error('Unable to update movie');
        }
    };
    

    const handleDeleteMovie = async (movieId) => {
        try {
            const response = await fetch(`https://movieapp-api-lms1.onrender.com/movies/deleteMovie/${movieId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` },
            });
            if (response.ok) {
                toast.success('Movie deleted successfully');
                getMovies();
            } else {
                toast.error('Unable to delete movie');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            toast.error('Unable to delete movie');
        }
    };

    return (
        <Container>
            <Row className="mb-4 d-flex gap-2">
                {user?.token && (
                    <>
                        {user.isAdmin && (
                            <Button variant="success" onClick={handleShow}>
                                Add Movie
                            </Button>
                        )}
                    </>
                )}
            </Row>

            <Row>
                {filteredMovies.map((movie) => (
                    <Col md={4} sm={6} xs={12} key={movie._id} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title>{movie.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Directed by: {movie.director}
                                </Card.Subtitle>
                                <Card.Text>
                                    <strong>Year:</strong> {movie.year}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Description:</strong> {movie.description}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Genre:</strong> {movie.genre}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Movie ID:</strong> {movie._id}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Comments:</strong>{' '}
                                    {movie.comments?.length ? (
                                        <ul>
                                            {movie.comments.map((comment, index) => (
                                                <li key={comment._id || index}>
                                                    {comment.comment}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No comments yet'
                                    )}
                                </Card.Text>
                                <Button
                                    variant="info"
                                    onClick={() => {
                                        setMovieId(movie._id);
                                        setShowCommentModal(true);
                                    }}
                                >
                                    Add Comment
                                </Button>
                                {user.isAdmin && (
                                    <>
                                        <Button
                                            variant="warning"
                                            className="ms-2"
                                            onClick={() => handleUpdateModalShow(movie)}
                                        >
                                            Update
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="ms-2"
                                            onClick={() => handleDeleteMovie(movie._id)}
                                        >
                                            Delete
                                        </Button>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Movie</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={addMovie}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter title"
                                value={newMovie.title}
                                onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Director</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter director"
                                value={newMovie.director}
                                onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter year"
                                value={newMovie.year}
                                onChange={(e) => setNewMovie({ ...newMovie, year: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Enter description"
                                value={newMovie.description}
                                onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Genre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter genre"
                                value={newMovie.genre}
                                onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showCommentModal} onHide={closeCommentModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Comment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleAddComment}>
                        <Form.Group className="mb-3">
                            <Form.Label>Comment</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter your comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showUpdateModal} onHide={handleUpdateModalClose}>
        <Modal.Header closeButton>
            <Modal.Title>Update Movie</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {movieToUpdate && (
                <Form onSubmit={handleUpdateMovie}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={movieToUpdate.title}
                            onChange={(e) =>
                                setMovieToUpdate({ ...movieToUpdate, title: e.target.value })
                            }
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Director</Form.Label>
                        <Form.Control
                            type="text"
                            value={movieToUpdate.director}
                            onChange={(e) =>
                                setMovieToUpdate({ ...movieToUpdate, director: e.target.value })
                            }
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Year</Form.Label>
                        <Form.Control
                            type="number"
                            value={movieToUpdate.year}
                            onChange={(e) =>
                                setMovieToUpdate({ ...movieToUpdate, year: e.target.value })
                            }
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={movieToUpdate.description}
                            onChange={(e) =>
                                setMovieToUpdate({ ...movieToUpdate, description: e.target.value })
                            }
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Genre</Form.Label>
                        <Form.Control
                            type="text"
                            value={movieToUpdate.genre}
                            onChange={(e) =>
                                setMovieToUpdate({ ...movieToUpdate, genre: e.target.value })
                            }
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Update Movie
                    </Button>
                </Form>
            )}
        </Modal.Body>
    </Modal>

        </Container>
    );
}
