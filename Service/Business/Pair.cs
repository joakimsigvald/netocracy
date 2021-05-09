using System;

namespace Netocracy.Console.Business
{
    public class Pair : IComparable<Pair>
    {
        public int Id { get; set; }
        public Individual[] Individuals { get; set; }
        public float Popularity { get; set; }

        public int CompareTo(Pair other) => other.Popularity.CompareTo(Popularity);
    }
}