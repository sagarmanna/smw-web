const Test = () => {
    return (
        <>
        <div> Test Page | ENV </div>
        <pre>
        NEXT_PUBLIC_ENV: {process.env.NEXT_PUBLIC_ENV}
        {/* <br />
        NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL}
        <br />
        NEXT_PUBLIC_LEGACY_URL: {process.env.NEXT_PUBLIC_LEGACY_URL}
        <br /> */}
        </pre>
        </>
    )
}

export default Test;