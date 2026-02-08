import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../api'




export function MainPage({ header, routes, title = "CallManager" }) {
    return (
    <div className="min-h-screen flex flex-col bg-body-bg text-text-success dark:bg-dark-body-bg dark:text-dark-text-tertiary">
        {header}
      <main className="lg:container lg:mx-auto py-6 ml-2 lg:px-6 lg:flex-grow">
        {routes}
      </main>

    </div>

    )
}
