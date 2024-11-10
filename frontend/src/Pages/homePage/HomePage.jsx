import { useNavigate } from 'react-router-dom';
import exampleImage1 from '../../assets/img/1.jpg';
import scooter from '../../assets/img/scooter.jpg'
import ebike from "../../assets/img/e-bike2.jpg"
import CardList from '../../Components/HomePageCardList';
const HomePage = () => {
    const navigate = useNavigate();
     const cardContents = [
        { title: 'E-Scooter', text: 'Explore more.', image: scooter },
        { title: 'E-Bike', text: 'Explore more', image: ebike },
        // { title: 'Card 3', text: 'This is the third card content.', image: img3 },
    ];
    return (
        <div id="carouselExampleSlidesOnly" className="carousel slide position-relative" data-bs-ride="carousel" data-bs-interval="2000">
            <div className="HopmepageImageText"style={{zIndex: 2}}>Welcome to E-vehicle</div>
            <button 
                className="homePageLoginButton position-absolute"
                style={{ top: '25%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
                onClick={()=>{
                    navigate('/Login')
                }}
            >
                Log in
            </button>
            
            {/* Carousel */}
            <div className="carousel-inner">
                <div className="carousel-item active">
                    <img src={exampleImage1} className="d-block w-100 " alt="..." />
                </div>
                <div className="carousel-item">
                    <img src={exampleImage1} className="d-block w-100" alt="..." />
                </div>
                <div className="carousel-item">
                    <img src={exampleImage1} className="d-block w-100" alt="..." />
                </div>
            </div>
            {/* CardList */}
            <CardList cardContents={cardContents} />
        </div>
    );
};

export default HomePage;
