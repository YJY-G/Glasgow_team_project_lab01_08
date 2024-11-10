const Carousel = ({image})=>{
    return(
        <div className="carousel-inner">
            <div className="carousel-item active">
            <img src={image} className="d-block w-100" alt="..." />
            </div>
        </div>
    );
}

const CarouselList =(imageList)=>{
    return(
        <div className="carousel-inner">
           {imageList.map((content, index) => (
                <Carousel
                    key={index}
                    image={content.image}
                
                />
            ))}
        </div>
       
    );
}