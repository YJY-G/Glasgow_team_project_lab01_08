import React from 'react';
import { useNavigate } from 'react-router-dom';

const Card = ({ title, text, image, path }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(path);
    };

    return (
        <div className='card border-0 col-sm-5  rounded-5 HomeCard'>
            <button onClick={handleCardClick} className='card border-0' style={{ cursor: 'pointer', background: 'none' }}>

                <img src={image} alt={title} className='card-img-top' />
                <div className='card-body'>
                    <h5 className='card-title'>{title}</h5>
                    <p className='card-text'>{text}</p>
                </div>
            </button>
        </div>
    );
};


const CardList = ({ cardContents }) => {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {cardContents.map((content, index) => (
                <Card
                    key={index}
                    title={content.title}
                    text={content.text}
                    image={content.image}
                    url={content.path}
                />
            ))}
        </div>
    );
};

export default CardList;
