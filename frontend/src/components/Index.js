import {React, useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import {getUser} from './helpers/user-verification';
import axios from 'axios';
import { Container, Typography, Box, CircularProgress, Divider, Button, Alert, Collapse, 
         Grid, Paper, List, ListItem, ListItemText, Rating } from '@mui/material';
import ReviewCard from './helpers/ReviewCard';

const Index = () => {
    const [username, setUsername] = useState('');
    const [user, setUser] = useState(null);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWelcome, setShowWelcome] = useState(false); // Initialize to false by default
    const [trendingLocations, setTrendingLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const navigate = useNavigate();

    // Check if user has seen welcome message before and show it if they haven't
    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) { // Only show if they haven't seen it
            setShowWelcome(true);
        }
    }, []);

    // Set welcome message as seen after a delay
    useEffect(() => {
        if (user && showWelcome) {
            // After 10 seconds, hide the welcome message and record in localStorage
            const timer = setTimeout(() => {
                localStorage.setItem('hasSeenWelcome', 'true');
                setShowWelcome(false);
            }, 10000);
            
            return () => clearTimeout(timer);
        }
    }, [user, showWelcome]);

    // Verify user is logged in
    useEffect(() => {
        const verifyUser = async () => {
            try {
                const resp = await getUser();
                if (resp) {
                    setUsername(resp.username);
                    setUser(resp);
                } else {
                    navigate("/login");
                }
            } catch (err) {
                console.error("Error verifying user:", err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, [navigate]);

    // Fetch review feed
    useEffect(() => {
        const fetchFeed = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3001/api/reviews/feed", {
                    headers: { "x-access-token": token }
                });
                
                if (response.data && Array.isArray(response.data.reviews)) {
                    setFeed(response.data.reviews);
                    setError(null);
                } else {
                    console.error('Invalid feed format:', response.data);
                    setFeed([]);
                    setError("Server returned invalid data format");
                }
            } catch (err) {
                console.error("Error fetching feed:", err);
                setError("Failed to load feed. Please try again later.");
                setFeed([]);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchFeed();
        }
    }, [user]);
    
    // Fetch trending locations
    useEffect(() => {
        const fetchTrendingLocations = async () => {
            if (!user) return;

            try {
                setLoadingLocations(true);
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:3001/api/location/trending", {
                    headers: { "x-access-token": token }
                });
                
                if (response.data && Array.isArray(response.data.locations)) {
                    setTrendingLocations(response.data.locations.slice(0, 10)); // Get top 10
                }
            } catch (err) {
                console.error("Error fetching trending locations:", err);
            } finally {
                setLoadingLocations(false);
            }
        };

        if (user) {
            fetchTrendingLocations();
        }
    }, [user]);
    
    // Handle refresh feed
    const handleRefreshFeed = () => {
        if (user) {
            // Clear feed to show loading state
            setFeed([]);
            setLoading(true);
            setError(null);
            
            const fetchFeed = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await axios.get("http://localhost:3001/api/reviews/feed", {
                        headers: { "x-access-token": token }
                    });
                    
                    if (response.data && Array.isArray(response.data.reviews)) {
                        setFeed(response.data.reviews);
                    } else {
                        setError("Server returned invalid data format");
                    }
                } catch (err) {
                    setError("Failed to load feed. Please try again later.");
                } finally {
                    setLoading(false);
                }
            };
            
            fetchFeed();
        }
    };

    // Trending Locations Component
    const TrendingLocations = () => (
        <Box sx={{ pl: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Trending Locations
            </Typography>
            {loadingLocations ? (
                <Box display="flex" justifyContent="center" py={2}>
                    <CircularProgress size={24} />
                </Box>
            ) : trendingLocations.length > 0 ? (
                <List dense sx={{ p: 0 }}>
                    {trendingLocations.map((location, idx) => (
                        <ListItem 
                            key={location._id} 
                            divider={idx < trendingLocations.length - 1}
                            disablePadding
                            sx={{ 
                                py: 1,
                                px: 0,
                                '&:hover': { 
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    cursor: 'pointer' 
                                }
                            }}
                            onClick={() => navigate(`/location-page/${location.placeId}`)}
                        >
                            <ListItemText 
                                primary={
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {idx + 1}. {location.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                {location.communityScore?.toFixed(1) || "N/A"}
                                            </Typography>
                                            <Rating value={location.communityScore || 0} readOnly size="small" precision={0.5} />
                                        </Box>
                                    </Box>
                                }
                                secondary={location.country}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                    No trending locations available.
                </Typography>
            )}
        </Box>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Content Grid */}
            <Grid container spacing={3}>
                {/* Main Content Area */}
                <Grid item xs={12} md={9}>
                    {/* Welcome Header with collapse animation - only shown if user hasn't seen it */}
                    <Collapse in={showWelcome}>
                        <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Welcome back, {user?.firstName || username}!
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                Check out the latest reviews from people you follow
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 4 }} />
                    </Collapse>
                    
                    {/* Feed Content */}
                    <Box sx={{ mb: 4 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" py={6}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
                            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                        ) : feed.length > 0 ? (
                            feed.map((review, index) => (
                                <ReviewCard key={`${review._id}-${index}`} review={review} />
                            ))
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Typography variant="h6" gutterBottom>
                                    No reviews to show yet
                                </Typography>
                                <Typography variant="body1" color="text.secondary" paragraph>
                                    Follow more people or explore new locations to see reviews here!
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* End of Feed Footer */}
                    {!loading && feed.length > 0 && (
                        <div>
                            <Divider sx={{ mb: 4 }} />
                            <Box sx={{ mb: 4, textAlign: 'center' }}>
                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                    You've reached the end of your feed. Hit refresh to check for updates!
                                </Typography>
                                <Button 
                                    variant="outlined"
                                    color="primary"
                                    onClick={handleRefreshFeed}
                                    sx={{ mt: 2}}
                                >
                                    Refresh Feed
                                </Button>
                            </Box>
                        </div>
                    )}
                </Grid>
                
                {/* Trending Locations Sidebar */}
                <Grid item md={3} sx={{ 
                    display: { xs: 'none', md: 'block' }, 
                    position: 'sticky',
                    top: 24
                }}>
                    <TrendingLocations />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Index;