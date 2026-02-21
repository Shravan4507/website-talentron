import { useState, useRef, useEffect } from 'react'
import './SearchableDropdown.css'

interface SearchableDropdownProps {
    options: string[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    required?: boolean
    readOnly?: boolean
    allowManual?: boolean
}

const SearchableDropdown = ({
    options,
    value,
    onChange,
    placeholder = "Search...",
    label,
    required = false,
    readOnly = false,
    allowManual = true
}: SearchableDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [activeIndex, setActiveIndex] = useState(-1)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(search.toLowerCase())
    )

    // Calculate total available items (options + manual entry)
    const totalItems = filteredOptions.length > 0
        ? (allowManual ? filteredOptions.length + 1 : filteredOptions.length)
        : (allowManual ? 1 : 0)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearch('')
                setActiveIndex(-1)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Ensure highlighted item is visible while scrolling with keyboard
    useEffect(() => {
        if (activeIndex !== -1 && listRef.current) {
            const activeElement = listRef.current.children[activeIndex] as HTMLElement
            if (activeElement) {
                const container = listRef.current
                const elementTop = activeElement.offsetTop
                const elementBottom = elementTop + activeElement.offsetHeight
                const containerTop = container.scrollTop
                const containerBottom = containerTop + container.offsetHeight

                if (elementTop < containerTop) {
                    container.scrollTop = elementTop
                } else if (elementBottom > containerBottom) {
                    container.scrollTop = elementBottom - container.offsetHeight
                }
            }
        }
    }, [activeIndex])

    const handleSelect = (option: string) => {
        onChange(option)
        setSearch('')
        setIsOpen(false)
        setActiveIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                setIsOpen(true)
                setActiveIndex(0)
            }
            return
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                if (totalItems > 0) {
                    setActiveIndex(prev => (prev + 1) % totalItems)
                }
                break
            case 'ArrowUp':
                e.preventDefault()
                if (totalItems > 0) {
                    setActiveIndex(prev => (prev - 1 + totalItems) % totalItems)
                }
                break
            case 'Enter':
                e.preventDefault()
                if (activeIndex !== -1) {
                    if (activeIndex < filteredOptions.length) {
                        handleSelect(filteredOptions[activeIndex])
                    } else if (allowManual) {
                        // Manual entry selection
                        handleSelect(search || value)
                    }
                } else if (search && allowManual) {
                    handleSelect(search)
                }
                break
            case 'Escape':
                setIsOpen(false)
                setSearch('')
                setActiveIndex(-1)
                break
            case 'Tab':
                setIsOpen(false)
                setSearch('')
                setActiveIndex(-1)
                break
        }
    }

    const handleTriggerClick = () => {
        setIsOpen(prev => !prev)
        if (!isOpen) {
            setSearch('')
            setActiveIndex(-1)
        }
    }

    if (readOnly) {
        return (
            <div className="searchable-dropdown read-only">
                {label && <label>{label}</label>}
                <input type="text" value={value} readOnly className="read-only-input" />
            </div>
        )
    }

    return (
        <div className="searchable-dropdown" ref={dropdownRef}>
            {label && <label>{label}</label>}
            <div className={`dropdown-container ${isOpen ? 'is-open' : ''}`}>
                <div className="dropdown-trigger-wrapper">
                    <input
                        type="text"
                        className="dropdown-trigger-input"
                        value={isOpen ? search : (value || '')}
                        placeholder={isOpen ? "Type to filter..." : placeholder}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setActiveIndex(-1)
                        }}
                        onClick={handleTriggerClick}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        readOnly={!allowManual && !isOpen}
                    />
                    <svg className={`chevron ${isOpen ? 'up' : 'down'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>

                {isOpen && (
                    <div className="dropdown-menu">
                        <div className="options-list" ref={listRef}>
                            {filteredOptions.length > 0 ? (
                                <>
                                    {filteredOptions.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`option-item ${option === value ? 'active' : ''} ${activeIndex === index ? 'focused' : ''}`}
                                            onClick={() => handleSelect(option)}
                                            onMouseEnter={() => setActiveIndex(index)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                    {allowManual && (
                                        <>
                                            <div className="manual-entry-divider"></div>
                                            <div
                                                className={`option-item manual-entry ${activeIndex === filteredOptions.length ? 'focused' : ''}`}
                                                onClick={() => handleSelect(search || value)}
                                                onMouseEnter={() => setActiveIndex(filteredOptions.length)}
                                            >
                                                <span className="manual-entry-text">Can't find your {label || 'option'}?</span>
                                                <span className="manual-entry-subtext">Use "{search || 'entered value'}" manually</span>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                allowManual ? (
                                    <div
                                        className={`option-item manual-entry no-results-manual ${activeIndex === 0 ? 'focused' : ''}`}
                                        onClick={() => handleSelect(search)}
                                        onMouseEnter={() => setActiveIndex(0)}
                                    >
                                        <span className="manual-entry-text">Can't find your {label || 'option'}?</span>
                                        <span className="manual-entry-subtext">Type "{search}" manually</span>
                                    </div>
                                ) : (
                                    <div className="no-results-text">No matches found</div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
            {required && <input type="hidden" value={value} required />}
        </div>
    )
}

export default SearchableDropdown
