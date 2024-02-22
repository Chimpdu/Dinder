import React from 'react'

function Error({error}) {
  return (
    <>
     {error && <div className="error-card card red">
                        <div className="card-content white-text">
                          
                          <p>{error}</p>
                          </div>
                      </div>} 
    </>
  )
}

export default Error