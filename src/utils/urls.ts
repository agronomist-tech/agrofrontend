const setURLPair = (pair: string): void => {
    const url = new URL(window.location.href);
    if (pair ){
        url.searchParams.set('pair', pair);
    } else {
        url.searchParams.delete('pair');
    }
    window.history.pushState({}, '', url.toString());
}


export {setURLPair}