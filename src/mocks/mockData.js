import singhfamily from '../assets/singhfamily.jpg';
import rohan from '../assets/rohan.jpg';

export const mockStats = [
  { id: "stat-1", label: "Animals Rescued", value: 15420, suffix: "+" },
  { id: "stat-2", label: "Successful Adoptions", value: 12890, suffix: "+" },
  { id: "stat-3", label: "Verified Organizations", value: 340, suffix: "+" },
  { id: "stat-4", label: "Community Members", value: 85000, suffix: "+" }
];

export const mockAnimals = [
  {
    id: "animal-1",
    name: "Aurelius",
    breed: "Golden Retriever Mix",
    age: "2 Years",
    gender: "Male",
    location: "Emerald Hills Shelter, CA",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800",
    story: "Aurelius was found wandering near the national forest. He is incredibly gentle, loves playing fetch, and is wonderful with children.",
    tags: ["Friendly", "Active", "Vaccinated"],
    ngoId: "ngo-1"
  },
  {
    id: "animal-2",
    name: "Cleopatra",
    breed: "Calico Cat",
    age: "1 Year",
    gender: "Female",
    location: "Green Haven Rescues, NY",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800",
    story: "Cleopatra is a true royal beauty with striking markings. She is calm, affectionate, and loves to curl up next to warm fireplaces.",
    tags: ["Lap Cat", "Quiet", "Microchipped"],
    ngoId: "ngo-2"
  },
  {
    id: "animal-3",
    name: "Winston",
    breed: "English Bulldog",
    age: "4 Years",
    gender: "Male",
    location: "Hopeful Paws Sanctuary, TX",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800",
    story: "Winston was rescued from a high-intake facility. He has a heart of gold, loves short walks, and snores like an absolute gentleman.",
    tags: ["Housebroken", "Low Energy", "Neutered"],
    ngoId: "ngo-3"
  },
  {
    id: "animal-4",
    name: "Genevieve",
    breed: "Siberian Husky",
    age: "3 Years",
    gender: "Female",
    location: "Emerald Hills Shelter, CA",
    image: "https://images.unsplash.com/photo-1531308027406-8b98475099b4?auto=format&fit=crop&q=80&w=800",
    story: "Genevieve is an active, vocal, and stunning husky who thrives in cold weather. She needs an active owner who loves outdoor adventures.",
    tags: ["Energetic", "Vocal", "Needs Yard"],
    ngoId: "ngo-1"
  },
  {
    id: "animal-5",
    name: "Leopold",
    breed: "Border Collie Mix",
    age: "8 Months",
    gender: "Male",
    location: "Second Chance Angels, IL",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800",
    story: "Leopold is a highly intelligent pup who learns tricks in minutes. He is eager to please and would excel in agility training.",
    tags: ["Intelligent", "Agility Star", "Playful"],
    ngoId: "ngo-4"
  },
  {
    id: "animal-6",
    name: "Seraphina",
    breed: "Siamese Cat",
    age: "3 Years",
    gender: "Female",
    location: "Green Haven Rescues, NY",
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=800",
    story: "Seraphina is an elegant, talkative Siamese who demands premium cuddles. She gets along perfectly with other friendly cats.",
    tags: ["Affectionate", "Social", "Spayed"],
    ngoId: "ngo-2"
  }
];

export const mockNGOs = [
  {
    id: "ngo-1",
    name: "Emerald Hills Animal Sanctuary",
    location: "San Francisco, CA",
    rating: 4.9,
    rescuesCount: 3840,
    logo: "🌿",
    description: "Dedicated to the rescue, rehabilitation, and long-term care of stray and abandoned domestic animals in northern California.",
    founded: "2012"
  },
  {
    id: "ngo-2",
    name: "Green Haven Rescues & Adoption",
    location: "Brooklyn, NY",
    rating: 4.8,
    rescuesCount: 4210,
    logo: "🏡",
    description: "A highly-rated urban rescue organization focused on street cat colonies, veterinary care, and loving family placements.",
    founded: "2015"
  },
  {
    id: "ngo-3",
    name: "Hopeful Paws Shelter & Sanctuary",
    location: "Austin, TX",
    rating: 4.9,
    rescuesCount: 2980,
    logo: "✨",
    description: "A state-of-the-art facility featuring spacious play yards and specialized recovery wings for injured rescue dogs.",
    founded: "2018"
  },
  {
    id: "ngo-4",
    name: "Second Chance Angels",
    location: "Chicago, IL",
    rating: 4.7,
    rescuesCount: 1850,
    logo: "👼",
    description: "Specialized foster network prioritizing seniors, special needs pets, and animals requiring critical rehabilitation.",
    founded: "2014"
  }
];

export const mockPosts = [
  {
    id: "post-1",
    author: "Eleanor Vance",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    date: "May 28, 2026",
    title: "Tips for introducing a senior rescue dog to cats",
    excerpt: "Successfully welcomed Winston (a 7yo rescue bulldog) into my home with two calico cats. Here are the step-by-step techniques we used over two weeks...",
    likes: 142,
    comments: 38,
    category: "Adoption Tips"
  },
  {
    id: "post-2",
    author: "Harrison Brooks",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    date: "May 26, 2026",
    title: "Best hiking trails in Emerald Hills for active dogs",
    excerpt: "Took our Siberian Husky Genevieve out on the redwood loop this weekend. Highlighting the shaded paths, dog-friendly watering holes, and essential pack gear...",
    likes: 98,
    comments: 12,
    category: "Rescue Stories"
  },
  {
    id: "post-3",
    author: "Clara Montgomery",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    date: "May 25, 2026",
    title: "Rehabilitation progress: Leopold's agility milestones",
    excerpt: "Eight months ago, Leopold was terrified of stepping onto turf. Today, he successfully navigated our beginner agility course with high focus and absolute joy...",
    likes: 215,
    comments: 49,
    category: "Success Stories"
  }
];

export const mockStories = [
  {
    id: "story-1",
    petName: "Sheru",
    adopter: "The Singh Family",
    quote: "When we first met Sheru, he was shy and hesitant around people. With a little patience and a lot of love, he became the happiest member of our family. Adopting him has brought so much joy into our home.",
    avatar: singhfamily,
    achievement: "FOUND HIS FOREVER HOME"
  },
  {
    id: "story-2",
    petName: "Misty",
    adopter: "Ananya & Rohan",
    quote: "Misty was rescued from the streets and needed time to trust people. The support from the rescue team made all the difference. Today, she's playful, confident, and follows us around the house wherever we go.",
    avatar: rohan,
    achievement: "FROM RESCUE TO FAMILY"
  }
];
