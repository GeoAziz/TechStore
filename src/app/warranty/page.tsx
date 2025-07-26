
import { ShieldCheck, Cpu, Laptop } from 'lucide-react';

export default function WarrantyPage() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <ShieldCheck className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2 glow-primary">Warranty Information</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          We stand by our tech. All products are covered by our standard warranty protocol to ensure your peace of mind.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6 text-lg text-muted-foreground">
        <div className="p-6 glass-panel rounded-lg">
          <h2 className="text-2xl font-bold text-accent mb-3 flex items-center gap-3"><Laptop className="w-8 h-8"/> Standard Hardware Warranty</h2>
          <p>All hardware components, including laptops, desktops, monitors, and peripherals, purchased from Zizo OrderVerse are covered by a <strong>1-year (365 days) limited warranty</strong> from the date of purchase. This warranty covers manufacturing defects and hardware failures under normal use conditions.</p>
        </div>
        
        <div className="p-6 glass-panel rounded-lg">
          <h2 className="text-2xl font-bold text-accent mb-3 flex items-center gap-3"><Cpu className="w-8 h-8"/> What Is Covered?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Manufacturing defects in materials and workmanship.</li>
            <li>Hardware component failure (e.g., faulty RAM, dead pixels on a monitor, non-functional ports).</li>
            <li>Failure to operate according to the manufacturer's specifications.</li>
          </ul>
        </div>

        <div className="p-6 glass-panel rounded-lg">
          <h2 className="text-2xl font-bold text-accent mb-3">What Is Not Covered?</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Damage caused by accident, abuse, misuse, liquid contact, fire, or other external cause.</li>
            <li>Damage caused by operating the product outside the manufacturer’s published guidelines.</li>
            <li>Products that have been modified to alter functionality or capability without the written permission of the manufacturer.</li>
            <li>Cosmetic damage, including but not limited to scratches, dents, and broken plastic on ports.</li>
            <li>Software-related issues, including viruses, malware, or OS corruption.</li>
          </ul>
        </div>

         <div className="p-6 glass-panel rounded-lg">
          <h2 className="text-2xl font-bold text-accent mb-3">How to Claim</h2>
          <p>To initiate a warranty claim, please navigate to our <a href="/contact" className="text-primary underline hover:glow-primary">Contact Page</a> and open a support ticket. Please include your original order ID and a detailed description of the issue. Our support crew will guide you through the diagnostic and replacement process.</p>
        </div>
      </div>
    </div>
  );
}
