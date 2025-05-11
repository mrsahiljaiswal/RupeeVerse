
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface TeamMember {
  name: string;
  bio: string;
  imageUrl?: string;
}

const TeamSection = () => {
  const teamMembers: TeamMember[] = [
    {
      name: "Akhil Kumar Singh",
      bio: "",
      imageUrl:"/akhil.png",
    },
    {
      name: "Aayushmaan Purohit",
      bio: "",
      imageUrl:"/aayushman.png"
    },
    {
      name: "Vishal Dhamu",
      bio: "",
      imageUrl: "/vishal.jpg",
      
    },
    {
      name: "Sahil Jaiswal",
      bio: "",
      imageUrl: "/sahil.png",
    }
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">Meet the Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The passionate minds behind RupeeVerse, working to make financial inclusion a reality for all.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {teamMembers.map((member, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 border border-white/10">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-28 w-28 mb-4 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                  {member.imageUrl ? (
                    <AvatarImage src={member.imageUrl} alt={member.name} />
                  ) : (
                    <AvatarFallback className="bg-muted text-xl font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                {/* <p className="text-primary font-medium text-sm mb-3">Co-Founder</p> */}
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
