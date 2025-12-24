import { useState, useEffect } from "react";
import { Menu, X, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "#home" },
        { name: "Services", href: "#services" },
        { name: "About", href: "#about" },
        { name: "Gallery", href: "#gallery" },
        { name: "Contact", href: "#contact" },
    ];

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <a
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            scrollToSection("#home");
                        }}
                        className="flex items-center gap-3 group"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isScrolled ? "bg-amber-100/50 text-amber-600" : "bg-white/20 text-gray-800 backdrop-blur-sm"}`}>
                            <Scissors className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className={`font-serif text-xl font-bold transition-colors ${isScrolled ? "text-gray-900" : "text-gray-900"}`}>
                                Prashant
                            </span>
                            <span className={`text-[10px] uppercase tracking-[0.3em] font-medium -mt-1 transition-colors ${isScrolled ? "text-amber-600" : "text-amber-700"}`}>
                                Hair Saloon
                            </span>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(link.href);
                                }}
                                className={`text-sm font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-amber-600 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${isScrolled ? "text-gray-600 hover:text-amber-600" : "text-gray-800 hover:text-amber-600"
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <Button
                            variant="hero"
                            size="default"
                            onClick={() => scrollToSection("#contact")}
                        >
                            Book Now
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden text-foreground p-2"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? "max-h-96 pb-6" : "max-h-0"
                        }`}
                >
                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-200/50 bg-white/90 backdrop-blur-md p-6 rounded-b-2xl shadow-xl mt-2">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(link.href);
                                }}
                                className="text-gray-700 hover:text-amber-600 font-medium transition-colors py-2"
                            >
                                {link.name}
                            </a>
                        ))}
                        <Button
                            variant="hero"
                            className="mt-2 w-full"
                            onClick={() => scrollToSection("#contact")}
                        >
                            Book Now
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
